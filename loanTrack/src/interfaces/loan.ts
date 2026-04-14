import { LoanStatus } from '../enums';

export interface CreateLoanPayload {
  userId: string;
  amount: number;
  interestRate: number;
  duration: number;
}

export interface LoanRecord extends CreateLoanPayload {
  loanId: string;
  owner: string;
  emi: number;
  totalInterest: number;
  totalPayment: number;
  status: LoanStatus;
  createdAt: string;
}

export interface PaymentScheduleItem {
  month: number;
  dueDate: string;
  principal: number;
  interest: number;
  balance: number;
  status: LoanStatus;
}
