import { Request, Response } from "express";
import { getActiveBorrowedAmount } from "../helpers/loan";
import * as loanService from "../services/loan";
import * as userService from "../services/user";
import { v4 as uuidv4 } from "uuid";
import { Loan } from "../models/loan";
import { AuthenticatedRequest } from "../middleware/auth";

const calculateLoan = (amount: number, rate: number, duration: number) => {
  const monthlyRate = rate / 12 / 100;

  const emi =
    (amount * monthlyRate * Math.pow(1 + monthlyRate, duration)) /
    (Math.pow(1 + monthlyRate, duration) - 1);

  const totalPayment = emi * duration;
  const totalInterest = totalPayment - amount;

  return {
    emi: Number(emi.toFixed(2)),
    totalPayment: Number(totalPayment.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
  };
};

export const createLoan = async (req: Request, res: Response) => {
  try {
    const { amount, interestRate, duration } = req.body;
    const userId = (req as AuthenticatedRequest).auth?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized user" });
    }
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const loans = (await loanService.getLoansByUserId(userId)) as Loan[];
    const borrowedAmount = getActiveBorrowedAmount(loans);
    const remainingLimit = Math.max(0, user.loanLimit - borrowedAmount);

    if (amount > remainingLimit) {
      return res.status(400).json({
        error: "Loan amount exceeds your remaining limit",
        loanLimit: user.loanLimit,
        borrowedAmount,
        remainingLimit,
      });
    }

    const calc = calculateLoan(amount, interestRate, duration);

    const loan: Loan = {
      loanId: uuidv4(),
      userId,
      amount,
      interestRate,
      duration,
      ...calc,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };

    const result = await loanService.createLoan(loan);

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Error creating loan" });
  }
};

export const getLoan = async (req: Request, res: Response) => {
  try {
    const loanId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const loan = await loanService.getLoan(loanId);

    if (!loan) return res.status(404).json({ message: "Loan not found" });

    res.json(loan);
  } catch {
    res.status(500).json({ error: "Error fetching loan" });
  }
};

export const getAllLoans = async (_req: Request, res: Response) => {
  try {
    const userId = (_req as AuthenticatedRequest).auth?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized user" });
    }
    const loans = await loanService.getLoansByUserId(userId);
    return res.json(loans);
  } catch {
    return res.status(500).json({ error: "Error fetching loans" });
  }
};

export const closeLoan = async (req: Request, res: Response) => {
  try {
    const loanId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const loan = (await loanService.getLoan(loanId)) as Loan | null;

    if (!loan) return res.status(404).json({ message: "Loan not found" });

    loan.status = "CLOSED";

    await loanService.createLoan(loan); // overwrite

    res.json({ message: "Loan closed", loan });
  } catch {
    res.status(500).json({ error: "Error closing loan" });
  }
};

export const deleteLoan = async (req: Request, res: Response) => {
  try {
    const loanId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await loanService.deleteLoan(loanId);
    res.json({ message: "Loan deleted" });
  } catch {
    res.status(500).json({ error: "Error deleting loan" });
  }
};