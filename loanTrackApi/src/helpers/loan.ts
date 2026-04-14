import { Loan } from "../models/loan";

export const getActiveBorrowedAmount = (loans: Loan[]) =>
  loans
    .filter((loan) => loan.status === "ACTIVE")
    .reduce((sum, loan) => sum + loan.amount, 0);
