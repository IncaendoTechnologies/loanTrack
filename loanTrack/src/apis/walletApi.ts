import { handleResponse, requestWithFallback } from './client';

export interface WalletStatus {
  userId: string;
  walletBalance: number;
  loanLimit: number;
  usedLoanAmount: number;
  availableCredit: number;
}

export const getWalletStatus = async (userId: string): Promise<WalletStatus> => {
  const response = await requestWithFallback(`/wallet/${userId}`);
  return handleResponse<WalletStatus>(response);
};

export const topUpWallet = async (payload: { userId: string; amount: number }): Promise<any> => {
  const response = await requestWithFallback('/wallet/topup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse<any>(response);
};

export const transferToLoanLimit = async (payload: { userId: string; amount: number }): Promise<any> => {
  const response = await requestWithFallback('/wallet/transfer-to-loan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse<any>(response);
};