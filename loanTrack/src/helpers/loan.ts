import { LoanRecord } from '../interfaces';
import { LoanStatus } from '../enums';

export const getActiveLoans = (loans: LoanRecord[]) =>
  loans.filter((loan) => loan.status === LoanStatus.Active);

export const getBorrowedAmount = (loans: LoanRecord[]) =>
  getActiveLoans(loans).reduce((sum, loan) => sum + loan.amount, 0);

export const getRemainingBorrowLimit = (loanLimit: number, loans: LoanRecord[]) =>
  Math.max(0, loanLimit - getBorrowedAmount(loans));

export const getNextEmiSummary = (loans: LoanRecord[]) => {
  const activeLoans = getActiveLoans(loans);
  const totalEmi = activeLoans.reduce((sum, loan) => sum + loan.emi, 0);
  const nextDueDate = new Date();
  nextDueDate.setMonth(nextDueDate.getMonth() + 1);

  return {
    totalEmi,
    dueDateLabel: nextDueDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  };
};
