import { handleResponse, requestWithFallback } from './client';
import { ApiTransaction } from '../interfaces/transaction';

export const getTransactions = async (): Promise<ApiTransaction[]> => {
  const response = await requestWithFallback('/transactions');
  return handleResponse<ApiTransaction[]>(response);
};
