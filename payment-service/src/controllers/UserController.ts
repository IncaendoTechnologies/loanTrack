import { Request, Response } from "express";
import { CognitoIdentityProviderClient, ListUsersCommand } from "@aws-sdk/client-cognito-identity-provider";
import { PaymentService } from "../services/Payment";
import { generateServiceToken } from "../utils/serviceToken";
const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

export class UserController {
  verifyUsers = async (req: Request, res: Response) => {
    try {
      const { fromEmail, toEmail } = req.body;

      if (!fromEmail || !toEmail) {
        return res.status(400).json({ statusCode: 400, message: "Both fromEmail and toEmail are required" });
      }

      // Check toEmail
      const toUserCommand = new ListUsersCommand({
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID!,
        Filter: `email = \"${toEmail}\"`,
      });
      const toUserResponse = await cognitoClient.send(toUserCommand);
      const toUser = toUserResponse.Users && toUserResponse.Users.length > 0 ? toUserResponse.Users[0] : null;

      if (!toUser) {
        return res.status(404).json({ statusCode: 404, message: "Receiver user not found" });
      }

      // Check fromEmail
      const fromUserCommand = new ListUsersCommand({
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID!,
        Filter: `email = \"${fromEmail}\"`,
      });
      const fromUserResponse = await cognitoClient.send(fromUserCommand);
      const fromUser = fromUserResponse.Users && fromUserResponse.Users.length > 0 ? fromUserResponse.Users[0] : null;

      if (!fromUser) {
        return res.status(200).json({ statusCode: 200, message: "Sender user not found, but it is acceptable" });
      }

      // Both found
      const toUserId = toUser.Attributes?.find(attr => attr.Name === "sub")?.Value || toUser.Username;
      const fromUserId = fromUser.Attributes?.find(attr => attr.Name === "sub")?.Value || fromUser.Username;

      return res.status(200).json({
        statusCode: 200,
        message: "Users verified successfully",
        data: {
          toUserId,
          fromUserId,
          toEmail,
          fromEmail
        }
      });
    } catch (error) {
      console.error("Error verifying users:", error);
      return res.status(500).json({ statusCode: 500, message: "Internal server error" });
    }
  };

  registrationWebhook = async (req: Request, res: Response) => {
    try {
      const { transactionId, fromUserId, fromEmail } = req.body;
      const authHeader = req.headers.authorization || "";

      if (!transactionId || !fromUserId) {
        return res.status(400).json({ message: "Missing transactionId or fromUserId" });
      }

      // Using PaymentService to handle transaction logic
      const paymentService = new PaymentService();
      const txn = await paymentService.getTransactionById(transactionId);
      if (!txn) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      if (txn.status !== "PENDING_REGISTRATION") {
        return res.status(400).json({ message: "Transaction is not in pending registration state" });
      }

      // Update transaction with fromUserId
      await paymentService.updateTransactionUserId(transactionId, fromUserId);

      // Perform debit/credit (We use the PaymentController helper methods or call API directly)
      const loanTrackApiUrl = process.env.LOAN_TRACK_API_URL || "http://localhost:8000";
      const token = generateServiceToken();
      // 1. Debit
      const debitResponse = await fetch(`${loanTrackApiUrl}/wallet/debit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: fromUserId, amount: txn.amount }),
      });
      const debitData = await debitResponse.json();

      if (!debitResponse.ok || !debitData.success) {
        await paymentService.updateTransactionStatus(transactionId, "FAILED");
        return res.status(500).json({ message: "Debit failed after registration" });
      }

      // 2. Credit
      const creditResponse = await fetch(`${loanTrackApiUrl}/wallet/credit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${generateServiceToken()}`,
        },
        body: JSON.stringify({ userId: txn.toUserId, amount: txn.amount }),
      });
      const creditData = await creditResponse.json();

      if (!creditResponse.ok || !creditData.success) {
        await fetch(`${loanTrackApiUrl}/wallet/credit`, { // reverse debit
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${generateServiceToken()}`,
          },
          body: JSON.stringify({ userId: fromUserId, amount: txn.amount }),
        });
        await paymentService.updateTransactionStatus(transactionId, "FAILED");
        return res.status(500).json({ message: "Credit failed after registration" });
      }

      // Mark success
      await paymentService.updateTransactionStatus(transactionId, "SUCCESS");

      // Notify external app
      if (txn.callbackUrl) {
        console.log(`[Callback] Sending status SUCCESS to ${txn.callbackUrl}`);
        try {
          await fetch(txn.callbackUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactionId, status: "SUCCESS", timestamp: new Date().toISOString() }),
          });
        } catch (callbackErr) {
          console.error("[Callback] Failed:", callbackErr);
        }
      }

      return res.status(200).json({
        statusCode: 200,
        message: "Payment successfully processed after registration",
        data: {
          status: "SUCCESS",
          fromUserId,
          toUserId: txn.toUserId,
          amount: txn.amount
        }
      });
    } catch (error) {
      console.error("Error in registrationWebhook:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}
