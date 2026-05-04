import { handleResponse, requestWithFallback } from './client';

export interface ApiTransaction {
  owner: string;
  transactionId: string;
  loanId?: string;
  amount: number;
  type: string;
  date: string;
  status?: string;
  note?: string;
}

export const getTransactions = async (): Promise<ApiTransaction[]> => {
  const response = await requestWithFallback('/transactions');
  return handleResponse<ApiTransaction[]>(response);
};
