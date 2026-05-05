export interface Loan {
  loanId: string;
  userId: string;
  owner: string;

  amount: number;
  interestRate: number;
  duration: number;

  emi: number;
  totalInterest: number;
  totalPayment: number;

  usedLoanAmount: number;
  usedWalletAmount: number;
  status: 'ACTIVE' | 'CLOSED';

  createdAt: string;
}