
export interface SendOtpPayload {
  transactionId: string;
  userId: string;
}

export interface ConfirmSignUpPayload {
  transactionId: string;
  fromUserId: string;
  fromEmail: string;
}

export interface ConfirmPaymentPayload {
  transactionId: string;
  userId: string;
  otp: string;
  isVerifiedByCognito: boolean;
}
