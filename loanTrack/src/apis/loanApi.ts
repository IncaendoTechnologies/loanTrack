import { handleResponse, requestWithFallback } from './client';
import type { CreateLoanPayload, LoanRecord } from '../interfaces';
export type { CreateLoanPayload, LoanRecord } from '../interfaces';

export const createLoan = async (payload: CreateLoanPayload): Promise<LoanRecord> => {
  const response = await requestWithFallback('/loans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse<LoanRecord>(response);
};

export const getAllLoans = async (): Promise<LoanRecord[]> => {
  const response = await requestWithFallback('/loans');
  return handleResponse<LoanRecord[]>(response);
};
