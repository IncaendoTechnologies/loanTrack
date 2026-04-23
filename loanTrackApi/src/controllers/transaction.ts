import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import TransactionServices from "../services/transaction";
import { AuthenticatedRequest } from "../middleware/auth";
import { Transaction } from "../models/transaction";

class TransactionController {
  
  // ✅ CREATE TRANSACTION
  static async createTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      const owner = req.auth?.sub;

      if (!owner) {
        return res.status(401).json({ error: "Unauthorized user" });
      }

      const { loanId, amount, type, date } = req.body;

      if (!loanId || !amount || !type) {
        return res.status(400).json({
          error: "loanId, amount and type are required",
        });
      }

      const transaction: Transaction = {
        owner,
        transactionId: uuidv4(),
        loanId,
        amount,
        type,
        date: date || new Date().toISOString(),
      };

      const service = new TransactionServices(transaction);
      const result = await service.createTransaction();

      return res.status(201).json(result);
    } catch (error) {
      console.error("Error creating transaction:", error);
      return res.status(500).json({
        error: "Error creating transaction",
      });
    }
  }

  // ✅ GET ALL TRANSACTIONS (BY OWNER)
  static async getAllTransactions(req: AuthenticatedRequest, res: Response) {
    try {
      const owner = req.auth?.sub;

      if (!owner) {
        return res.status(401).json({ error: "Unauthorized user" });
      }

      const transactions =
        await TransactionServices.getTransactionsByOwner(owner);

      return res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return res.status(500).json({
        error: "Error fetching transactions",
      });
    }
  }
}

export default TransactionController;
