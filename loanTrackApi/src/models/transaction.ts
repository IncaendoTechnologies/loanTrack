export interface Transaction {
  owner: string;
  transactionId: string;
  loanId: string;
  amount: number;
  type: 'PAYMENT' | 'DISBURSEMENT' | 'INTEREST' | 'FEE'| 'REFUND'| 'CHARGE'|  'ADJUSTMENT';
  date: string;
}