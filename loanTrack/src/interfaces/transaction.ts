export interface ApiTransaction {
  owner: string;
  transactionId: string;
  loanId?: string;
  amount: number;
  type: string;
  date: string;
  status?: string;
  note?: string;
  sender?: {
    name: string;
    email: string;
    userId: string;
  };
  receiver?: {
    name: string;
    email: string;
    userId: string;
  };
}