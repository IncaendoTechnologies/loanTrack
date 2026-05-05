import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { exec } from "child_process";
import { PaymentService } from "../services/Payment";
import { OTPService } from "../services/OTPService";
import { generateServiceToken } from "../utils/serviceToken";

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  initiatePayment = async (req: Request, res: Response) => {
    try {
      const { fromUserId, fromEmail, toUserId, amount, note, callbackUrl } = req.body;

      if (!toUserId || !amount) {
        return res.status(400).json({ statusCode: 400, message: "toUserId and amount are required fields" });
      }

      const transactionId = `txn_${uuidv4()}`;

      // If missing fromUserId but we have fromEmail, it means we need registration
      if (!fromUserId && fromEmail) {
        const transaction = {
          transactionId,
          fromEmail,
          toUserId,
          amount,
          note,
          callbackUrl,
          status: "PENDING_REGISTRATION" as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await this.paymentService.createTransaction(transaction);

        const encodedEmail = encodeURIComponent(fromEmail || "");
        const encodedNote = encodeURIComponent(note || "");
        const encodedCallback = encodeURIComponent(callbackUrl || "");
        const deepLink = `loantrack://auth/signup?fromEmail=${encodedEmail}&amount=${amount}&toUserId=${toUserId}&note=${encodedNote}&callbackUrl=${encodedCallback}&transactionId=${transactionId}`;

        return res.status(403).json({
          statusCode: 403,
          action: "REQUIRE_REGISTRATION",
          message: "User is not registered. Please sign up to complete this payment.",
          data: {
            transactionId,
            fromEmail,
            amount,
            toUserId,
            note,
            callbackUrl,
            deepLink
          }
        });
      }

      if (!fromUserId) {
        return res.status(400).json({ statusCode: 400, message: "fromUserId is required when not registering" });
      }

      const transaction = {
        transactionId,
        fromUserId,
        toUserId,
        amount,
        note,
        callbackUrl,
        status: "INITIATED" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = await this.paymentService.createTransaction(transaction);

      const deepLink = `loantrack://confirm-payment?transactionId=${result.transactionId}&amount=${result.amount}`;

      return res.status(201).json({
        statusCode: 201,
        message: "Payment initiated",
        data: {
          transactionId: result.transactionId,
          amount: result.amount,
          status: result.status,
          deepLink
        },
      });
    } catch (error) {
      console.error("Error in initiatePayment:", error);
      return res.status(500).json({ statusCode: 500, message: "Internal server error in initiatePayment" });
    }
  };

  getTransaction = async (req: Request, res: Response) => {
    try {
      const { transactionId } = req.params;

      const txn = await this.paymentService.getTransactionById(transactionId);
      if (!txn) {
        return res.status(404).json({ statusCode: 404, message: "Transaction not found" });
      }

      return res.status(200).json({ statusCode: 200, data: txn });
    } catch (error) {
      return res.status(500).json({ statusCode: 500, message: "Internal server error" });
    }
  };

  requestOTP = async (req: Request, res: Response) => {
    try {
      const { transactionId, userId } = req.body;
      if (!transactionId || !userId) {
        return res.status(400).json({ statusCode: 400, message: "transactionId and userId are required" });
      }

      const txn = await this.paymentService.getTransactionById(transactionId);
      if (!txn) {
        return res.status(404).json({ statusCode: 404, message: "Transaction not found" });
      }

      // Check if user matches
      if (txn.fromUserId && txn.fromUserId !== userId) {
        return res.status(403).json({ statusCode: 403, message: "Unauthorized" });
      }

      // Get user email from Cognito
      const email = await OTPService.getUserEmail(userId);
      if (!email) {
        return res.status(404).json({ statusCode: 404, message: "User email not found in Cognito" });
      }

      // Generate and send OTP
      const otp = OTPService.generateOTP();
      await this.paymentService.updateTransactionOTP(transactionId, otp);
      await OTPService.sendOTPEmail(email, otp);

      return res.status(200).json({
        statusCode: 200,
        message: "OTP sent successfully to your registered email"
      });
    } catch (error) {
      console.error("Error in requestOTP:", error);
      return res.status(500).json({ statusCode: 500, message: "Failed to send OTP" });
    }
  };

  registrationWebhook = async (req: Request, res: Response) => {
    try {
      const { transactionId, fromUserId, fromEmail } = req.body;
      const authHeader = req.headers.authorization || "";

      if (!transactionId || !fromUserId) {
        return res.status(400).json({ statusCode: 400, message: "Missing transactionId or fromUserId" });
      }

      const txn = await this.paymentService.getTransactionById(transactionId);
      if (!txn) {
        return res.status(404).json({ statusCode: 404, message: "Transaction not found" });
      }

      if (txn.status !== "PENDING_REGISTRATION") {
        return res.status(400).json({ statusCode: 400, message: "Transaction is not in pending registration state" });
      }

      // Update transaction with fromUserId and set status to PENDING_AUTHORIZATION
      await this.paymentService.updateTransactionUserId(transactionId, fromUserId);
      await this.paymentService.updateTransactionStatus(transactionId, "PENDING_AUTHORIZATION");

      return res.status(200).json({
        statusCode: 200,
        message: "User linked successfully. Payment is now pending authorization.",
        data: {
          status: "PENDING_AUTHORIZATION",
          fromUserId,
          toUserId: txn.toUserId,
          amount: txn.amount
        }
      });
    } catch (error) {
      console.error("Error in registrationWebhook:", error);
      return res.status(500).json({ statusCode: 500, message: "Internal server error" });
    }
  };

  public confirmPayment = async (req: Request, res: Response) => {
    try {
      const { transactionId, userId, otp, isVerifiedByCognito } = req.body;
      const authHeader = req.headers.authorization || "";

      if (!transactionId || !userId) {
        return res.status(400).json({ statusCode: 400, message: "Missing required fields" });
      }

      const txn = await this.paymentService.getTransactionById(transactionId);

      if (!txn) {
        return res.status(404).json({ statusCode: 404, message: "Transaction not found" });
      }

      if (!txn.fromUserId || txn.fromUserId !== userId) {
        return res.status(403).json({ statusCode: 403, message: "Unauthorized payment attempt" });
      }

      // Verify OTP if not already verified by Cognito (or if we prefer our own verification)
      if (!isVerifiedByCognito) {
        if (!otp || txn.otp !== otp) {
          return res.status(400).json({ statusCode: 400, message: "Invalid or expired OTP" });
        }
      }

      // Now txn.fromUserId is guaranteed to be a string
      const senderUserId: string = txn.fromUserId;

      if (
        txn.status !== "INITIATED" &&
        txn.status !== "PENDING_AUTHORIZATION"
      ) {
        return res.status(400).json({
          statusCode: 400,
          message: `Transaction cannot be processed. Current status: ${txn.status}`,
        });
      }

      await this.paymentService.updateTransactionStatus(
        transactionId,
        "PROCESSING"
      );

      const debitSuccess = await this.debitWallet(
        senderUserId,
        txn.amount,
        authHeader
      );

      if (!debitSuccess) {
        await this.paymentService.updateTransactionStatus(
          transactionId,
          "FAILED"
        );
        return res.status(500).json({ statusCode: 500, message: "Debit failed" });
      }

      const creditSuccess = await this.creditWallet(
        txn.toUserId,
        txn.amount,
        authHeader
      );

      if (!creditSuccess) {
        await this.creditWallet(senderUserId, txn.amount, authHeader); // reverse debit

        await this.paymentService.updateTransactionStatus(
          transactionId,
          "REVERSED"
        );

        return res.status(500).json({
          statusCode: 500,
          message: "Credit failed, refunded to sender",
        });
      }

      // 9️⃣ SUCCESS
      await this.paymentService.updateTransactionStatus(
        transactionId,
        "SUCCESS"
      );

      // Notify external app
      if (txn.callbackUrl) {
        this.sendCallback(txn.callbackUrl, transactionId, "SUCCESS");
      }

      return res.status(200).json({
        statusCode: 200,
        status: "SUCCESS",
        message: "Payment completed successfully",
      });

    } catch (error) {
      console.error("Error in confirmPayment:", error);
      return res.status(500).json({ statusCode: 500, message: "Internal server error" });
    }
  };

  private async debitWallet(userId: string, amount: number, authHeader: string): Promise<boolean> {
    console.log(`Debiting ₹${amount} from ${userId}`);
    try {
      const loanTrackApiUrl = process.env.LOAN_TRACK_API_URL || "http://localhost:3000";
      const response = await fetch(`${loanTrackApiUrl}/v1/wallet/debit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${generateServiceToken()}`,
        },
        body: JSON.stringify({ userId, amount }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        console.error("Debit failed response:", data);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error calling debit API:", error);
      return false;
    }
  }

  private async creditWallet(userId: string, amount: number, authHeader: string): Promise<boolean> {
    console.log(`Crediting ₹${amount} to ${userId}`);
    try {
      const loanTrackApiUrl = process.env.LOAN_TRACK_API_URL || "http://localhost:3000";
      const token = generateServiceToken();
      const response = await fetch(`${loanTrackApiUrl}/v1/wallet/credit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, amount }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        console.error("Credit failed response:", data);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error calling credit API:", error);
      return false;
    }
  }

  private async sendCallback(url: string, transactionId: string, status: string) {
    console.log(`[Callback] Sending status ${status} to ${url}`);
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, status, timestamp: new Date().toISOString() }),
      });
      console.log("[Callback] Sent successfully.");
    } catch (error) {
      console.error("[Callback] Failed to send:", error);
    }
  }
}