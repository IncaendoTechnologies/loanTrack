export type TransactionStatus =
  | 'INITIATED'
  | 'PENDING_REGISTRATION'
  | 'PENDING_AUTHORIZATION'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'REVERSED';

export interface Transaction {
  transactionId: string;
  fromUserId?: string;
  fromEmail?: string;
  toUserId: string;
  amount: number;
  note?: string;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
  otp?: string;
  callbackUrl?: string;
}