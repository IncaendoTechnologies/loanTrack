// src/utils/wallet-calculator.ts

import { UserInput } from "../models/user";
import jwt from "jsonwebtoken";

const INTERNAL_SECRET = process.env.INTERNAL_JWT_SECRET!;
export interface DebitCalculationResult {
  success: boolean;
  walletUsed: number;
  creditUsed: number;
  updatedWalletBalance: number;
  updatedUsedLoanAmount: number;
  availableCredit: number;
  message?: string;
}

export class WalletCalculator {
  /**
   * Debit logic:
   * 1. Use wallet balance first
   * 2. If insufficient, use available credit
   * 3. Fail if total funds are insufficient
   */
  public static calculateDebit(
    user: UserInput,
    amount: number
  ): DebitCalculationResult {
    const walletBalance = user.walletBalance || 0;
    const loanLimit = user.loanLimit || 0;
    const usedLoanAmount = user.usedLoanAmount || 0;

    const availableCredit = loanLimit - usedLoanAmount;

    let walletUsed = 0;
    let creditUsed = 0;

    // Invalid amount
    if (amount <= 0) {
      return {
        success: false,
        walletUsed: 0,
        creditUsed: 0,
        updatedWalletBalance: walletBalance,
        updatedUsedLoanAmount: usedLoanAmount,
        availableCredit,
        message: "Invalid payment amount",
      };
    }

    // Case 1: Wallet covers full payment
    if (walletBalance >= amount) {
      walletUsed = amount;

      return {
        success: true,
        walletUsed,
        creditUsed: 0,
        updatedWalletBalance: walletBalance - walletUsed,
        updatedUsedLoanAmount: usedLoanAmount,
        availableCredit,
      };
    }

    // Case 2: Wallet + Credit
    walletUsed = walletBalance;
    const remainingAmount = amount - walletBalance;

    // Insufficient total funds
    if (availableCredit < remainingAmount) {
      return {
        success: false,
        walletUsed: 0,
        creditUsed: 0,
        updatedWalletBalance: walletBalance,
        updatedUsedLoanAmount: usedLoanAmount,
        availableCredit,
        message: "Insufficient wallet balance and credit limit",
      };
    }

    creditUsed = remainingAmount;

    return {
      success: true,
      walletUsed,
      creditUsed,
      updatedWalletBalance: 0,
      updatedUsedLoanAmount: usedLoanAmount + creditUsed,
      availableCredit: availableCredit - creditUsed,
    };
  }

  /**
   * Credit logic:
   * Add amount directly to receiver wallet
   */
  public static calculateCredit(
    currentWalletBalance: number,
    amount: number
  ): number {
    if (amount <= 0) {
      throw new Error("Invalid credit amount");
    }

    return currentWalletBalance + amount;
  }

  public generateServiceToken(): string {
    return  jwt.sign(
      {
        service: "payment-service",
        aud: "loantrack",
      },
      INTERNAL_SECRET,
      {
        expiresIn: "5m",
      }
    );
  }
}