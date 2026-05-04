import { handleResponse, requestWithFallback } from './client';
import type { ConfirmPaymentPayload, SendOtpPayload, ConfirmSignUpPayload } from '../interfaces';
export type { ConfirmPaymentPayload, SendOtpPayload, ConfirmSignUpPayload } from '../interfaces';

export const confirmPayment = async (payload: ConfirmPaymentPayload): Promise<any> => {
  const response = await requestWithFallback('/payment-service/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse<any>(response);
};

export const sendOtp = async (payload: SendOtpPayload): Promise<any> => {
  const response = await requestWithFallback('/payment-service/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse<any>(response);
};

export const confirmSignUpWebhook = async (payload: ConfirmSignUpPayload): Promise<any> => {
  const response = await requestWithFallback('/payment-service/signUp/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse<any>(response);
}
