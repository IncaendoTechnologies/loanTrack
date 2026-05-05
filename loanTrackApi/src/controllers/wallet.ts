import { Request, Response } from "express";
import { WalletService } from "../services/wallet";
import { WalletCalculator } from "../helpers/wallet";
import TransactionServices from "../services/transaction";
import * as loanService from "../services/loan";
import { getActiveBorrowedAmount } from "../helpers/loan";
import { v4 as uuidv4 } from "uuid";
import { stat } from "node:fs";
import { Loan } from "../models/loan";

export class WalletController {
  private walletService: WalletService;

  constructor() {
    this.walletService = new WalletService();
  }

  // ✅ GET Wallet Status
  public getWalletStatus = async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId as string;

      const user = await this.walletService.getUserById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const loans = (await loanService.getLoansByUserId(userId)) as Loan[];
      const borrowedAmount = getActiveBorrowedAmount(loans);

      const availableCredit =
        (user.loanLimit || 0) - (user.usedLoanAmount || 0) - borrowedAmount;

      return res.status(200).json({
        userId: user.id,
        walletBalance: user.walletBalance || 0,
        loanLimit: user.loanLimit || 0,
        usedLoanAmount: user.usedLoanAmount || 0,
        availableCredit,
      });
    } catch (error) {
      console.error("Error fetching wallet:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  // ✅ Debit API
  public debitWallet = async (req: Request, res: Response) => {
    try {
      const { userId, amount } = req.body;

      // Step 1: Validate request
      if (!userId || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid request" });
      }

      // Step 2: Fetch user
      const user = await this.walletService.getUserById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Step 3: Calculate debit using utility
      const calculation = WalletCalculator.calculateDebit(user, amount);

      // Step 4: Fail if insufficient funds
      if (!calculation.success) {
        return res.status(400).json({
          success: false,
          message: calculation.message,
        });
      }

      // Step 5: Update DB
      await this.walletService.updateUserFinancials(
        userId,
        calculation.updatedWalletBalance,
        calculation.updatedUsedLoanAmount
      );

      // Log transaction
      const transactionService = new TransactionServices({
        owner: userId,
        transactionId: uuidv4(),
        amount: -amount,
        type: "WALLET_TRANSFER",
        date: new Date().toISOString(),
        status: "SUCCESS",
        note: "Payment to User"
      });
      await transactionService.createTransaction();

      // Step 6: Response
      return res.status(200).json({
        success: true,
        walletUsed: calculation.walletUsed,
        creditUsed: calculation.creditUsed,
        remainingWallet: calculation.updatedWalletBalance,
        usedLoanAmount: calculation.updatedUsedLoanAmount,
        availableCredit: calculation.availableCredit,
      });

    } catch (error) {
      console.error("Error debiting wallet:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  // ✅ Credit API
  public creditWallet = async (req: Request, res: Response) => {
    try {
      const { userId, amount } = req.body;

      // Step 1: Validate request
      if (!userId || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid request" });
      }

      // Step 2: Fetch user
      const user = await this.walletService.getUserById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Step 3: Calculate updated wallet balance
      const updatedBalance = WalletCalculator.calculateCredit(
        user.walletBalance || 0,
        amount
      );

      // Step 4: Update DB
      await this.walletService.updateUserFinancials(
        userId,
        updatedBalance,
        user.usedLoanAmount || 0
      );

      // Log transaction
      const transactionService = new TransactionServices({
        owner: userId,
        transactionId: uuidv4(),
        amount: amount,
        type: "WALLET_TRANSFER",
        date: new Date().toISOString(),
        status: "SUCCESS",
        note: "Received Money"
      });
      await transactionService.createTransaction();

      // Step 5: Response
      return res.status(200).json({
        success: true,
        walletBalance: updatedBalance,
      });

    } catch (error) {
      console.error("Error crediting wallet:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  // ✅ Top Up Wallet from Loan Limit API
  public topupWallet = async (req: Request, res: Response) => {
    try {
      const { userId, amount } = req.body;

      if (!userId || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid request" });
      }

      const user = await this.walletService.getUserById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const loans = (await loanService.getLoansByUserId(userId)) as Loan[];
      const borrowedAmount = getActiveBorrowedAmount(loans);
      const availableCredit = (user.loanLimit || 0) - (user.usedLoanAmount || 0) - borrowedAmount;

      if (amount > availableCredit) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          message: "Insufficient loan limit available",
        });
      }

      const updatedBalance = (user.walletBalance || 0) + amount;
      const updatedUsedLoanAmount = (user.usedLoanAmount || 0) + amount;

      await this.walletService.updateUserFinancials(
        userId,
        updatedBalance,
        updatedUsedLoanAmount
      );

      // Log transaction
      const transactionService = new TransactionServices({
        owner: userId,
        transactionId: uuidv4(),
        amount: amount,
        type: "DISBURSEMENT",
        date: new Date().toISOString(),
        status: "SUCCESS",
        note: "Added from Loan Limit"
      });
      await transactionService.createTransaction();

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Wallet topped up successfully",
        walletBalance: updatedBalance,
        usedLoanAmount: updatedUsedLoanAmount,
        availableCredit: (user.loanLimit || 0) - updatedUsedLoanAmount - borrowedAmount,
      });

    } catch (error) {
      console.error("Error topping up wallet:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  // ✅ Transfer Wallet to Loan Limit API
  public transferToLoan = async (req: Request, res: Response) => {
    try {
      const { userId, amount } = req.body;

      if (!userId || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid request" });
      }

      const user = await this.walletService.getUserById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if ((user.walletBalance || 0) < amount) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          message: "Insufficient wallet balance",
        });
      }

      if ((user.usedLoanAmount || 0) < amount) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          message: "Cannot transfer more than used loan amount",
        });
      }

      const updatedBalance = (user.walletBalance || 0) - amount;
      const updatedUsedLoanAmount = (user.usedLoanAmount || 0) - amount;

      await this.walletService.updateUserFinancials(
        userId,
        updatedBalance,
        updatedUsedLoanAmount
      );

      // Log transaction
      const transactionService = new TransactionServices({
        owner: userId,
        transactionId: uuidv4(),
        amount: -amount,
        type: "REPAYMENT",
        date: new Date().toISOString(),
        status: "SUCCESS",
        note: "Repaid Loan from Wallet"
      });
      await transactionService.createTransaction();

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Transferred to loan limit successfully",
        walletBalance: updatedBalance,
        usedLoanAmount: updatedUsedLoanAmount,
        availableCredit: (user.loanLimit || 0) - updatedUsedLoanAmount,
      });

    } catch (error) {
      console.error("Error transferring to loan:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}