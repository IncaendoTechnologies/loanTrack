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

  status: 'ACTIVE' | 'CLOSED';

  createdAt: string;
}