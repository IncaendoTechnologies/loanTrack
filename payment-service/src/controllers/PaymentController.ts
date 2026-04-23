import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { PaymentService } from "../services/Payment";

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  initiatePayment = async (req: Request, res: Response) => {
    try {
      const { fromUserId, toUserId, amount, note } = req.body;

      // Basic validation
      if (!fromUserId || !toUserId || !amount) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const transactionId = `txn_${uuidv4()}`;

      const transaction = {
        transactionId,
        fromUserId,
        toUserId,
        amount,
        note,
        status: "INITIATED" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = await this.paymentService.createTransaction(transaction);

      return res.status(201).json({
        message: "Payment initiated",
        data: result,
      });
    } catch (error) {
      console.error("Error in initiatePayment:", error);
      return res.status(500).json({ message: "Internal server error in initiatePayment" });
    }
  };

  getTransaction = async (req: Request, res: Response) => {
    try {
      const { transactionId } = req.params;

      const txn = await this.paymentService.getTransactionById(transactionId);
      if (!txn) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      return res.status(200).json({ data: txn });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  // ✅ Confirm Payment API
  public confirmPayment = async (req: Request, res: Response) => {
    try {
      const { transactionId, otp, userId } = req.body;

      // 1️⃣ Validation
      if (!transactionId || !otp || !userId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // 2️⃣ Fetch transaction
      const txn = await this.paymentService.getTransactionById(transactionId);

      if (!txn) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // 3️⃣ Validate user (payer)
      if (txn.fromUserId !== userId) {
        return res.status(403).json({ message: "Unauthorized payment attempt" });
      }

      // 4️⃣ Validate status
      if (
        txn.status !== "INITIATED" &&
        txn.status !== "PENDING_AUTHORIZATION"
      ) {
        return res.status(400).json({
          message: `Transaction cannot be processed. Current status: ${txn.status}`,
        });
      }

      // 5️⃣ OTP validation (mock)
      if (otp !== "123456") {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      // 6️⃣ Update → PROCESSING
      await this.paymentService.updateTransactionStatus(
        transactionId,
        "PROCESSING"
      );

      // 7️⃣ Debit (simulate)
      const debitSuccess = await this.debitWallet(
        txn.fromUserId,
        txn.amount
      );

      if (!debitSuccess) {
        await this.paymentService.updateTransactionStatus(
          transactionId,
          "FAILED"
        );
        return res.status(500).json({ message: "Debit failed" });
      }

      // 8️⃣ Credit (simulate)
      const creditSuccess = await this.creditWallet(
        txn.toUserId,
        txn.amount
      );

      if (!creditSuccess) {
        // rollback
        await this.creditWallet(txn.fromUserId, txn.amount);

        await this.paymentService.updateTransactionStatus(
          transactionId,
          "REVERSED"
        );

        return res.status(500).json({
          message: "Credit failed, refunded to sender",
        });
      }

      // 9️⃣ SUCCESS
      await this.paymentService.updateTransactionStatus(
        transactionId,
        "SUCCESS"
      );

      return res.status(200).json({
        status: "SUCCESS",
        message: "Payment completed successfully",
      });

    } catch (error) {
      console.error("Error in confirmPayment:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

   private async debitWallet(userId: string, amount: number): Promise<boolean> {
    console.log(`Debiting ₹${amount} from ${userId}`);
    return true;
  }

  private async creditWallet(userId: string, amount: number): Promise<boolean> {
    console.log(`Crediting ₹${amount} to ${userId}`);
    return true;
  }
}