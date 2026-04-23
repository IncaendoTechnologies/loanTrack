export type TransactionStatus =
  | 'INITIATED'
  | 'PENDING_AUTHORIZATION'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'REVERSED';

export interface Transaction {
  transactionId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  note?: string;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
}