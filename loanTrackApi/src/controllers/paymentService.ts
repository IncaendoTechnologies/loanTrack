import { Request, Response } from "express";
import axios from "axios";
import { WalletCalculator } from "../helpers/wallet";
const PS_BASE_URL = process.env.PAYMENT_SERVICE_API_BASE_URL;

export class PaymentServiceController {
  private walletCalculator: WalletCalculator;
  constructor() {
    this.walletCalculator = new WalletCalculator();
  }
    
  public confirmPayment = async (req: Request, res: Response) => {
    try {
      const { transactionId, userId, otp, isVerifiedByCognito } = req.body;
      console.log(transactionId, userId, otp, isVerifiedByCognito);
      const token = this.walletCalculator.generateServiceToken();
      const response = await axios.post(
        `${PS_BASE_URL}/v1/payments/confirm`,
        {
          transactionId,
          userId,
          otp,
          isVerifiedByCognito,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return res.status(response.data.statusCode).json({
        statusCode: response.data.statusCode,
        message: response.data.message
      });
    } catch (error: any) {
      console.error("Error in confirmPayment=====", error.response);
      return res.status(500).json({ message: "Failed to confirm payment" });
    }
  };

  public sendOtp = async (req: Request, res: Response) => {
    try {
      const { transactionId, userId } = req.body;
      const token = this.walletCalculator.generateServiceToken();
      const response = await axios.post(`${PS_BASE_URL}/v1/payments/request-otp`, {
        transactionId,
        userId,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return res.status(response.data.statusCode).json({
        statusCode: response.data.statusCode,
        message: response.data.message
      });
    } catch (error: any) {
      console.error("Error in requestOTP:", error);
      return res.status(500).json({ message: "Failed to send OTP" });
    }
  };

  public confirmSignUp = async (req: Request, res: Response) => {
    try {
      const { transactionId, fromUserId, fromEmail } = req.body;
      const token = this.walletCalculator.generateServiceToken();
      const response = await axios.post(`${PS_BASE_URL}/v1/users/confirmSignUp`, {
        transactionId,
        fromUserId,
        fromEmail
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return res.status(response.data.statusCode).json({
        statusCode: response.data.statusCode,
        message: response.data.message
      });
    } catch (error: any) {
      console.error("Error in confirmSignUp:", error.data);
      return res.status(500).json({ message: "Failed to confirm sign up" });
    }
  };
}