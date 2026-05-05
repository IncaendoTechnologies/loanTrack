export interface User {
  id: string;
  owner: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  loanLimit: number;
  walletBalance?: number;
  usedLoanAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserInput {
  id: string;
  owner: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  loanLimit?: number;
  walletBalance: number;
  usedLoanAmount: number;
}
