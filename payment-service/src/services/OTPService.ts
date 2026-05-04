import { CognitoIdentityProviderClient, AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const sesClient = new SESClient({ region: process.env.AWS_REGION });

export class OTPService {
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async getUserEmail(userId: string): Promise<string | null> {
    try {
      const command = new AdminGetUserCommand({
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID!,
        Username: userId,
      });
      const response = await cognitoClient.send(command);
      const emailAttr = response.UserAttributes?.find(attr => attr.Name === "email");
      return emailAttr ? emailAttr.Value || null : null;
    } catch (err) {
      console.error("Error fetching user email from Cognito:", err);
      return null;
    }
  }

  static async sendOTPEmail(email: string, otp: string) {
    try {
      const sender = process.env.SES_SENDER_EMAIL || "noreply@incaendo.com";

      const command = new SendEmailCommand({
        Source: sender,
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: { Data: "Your Payment Confirmation OTP" },
          Body: { Text: { Data: `Your OTP for the payment confirmation is: ${otp}. Do not share this with anyone.` } }
        }
      });
      await sesClient.send(command);
      console.log("[SES] OTP email sent successfully.");
    } catch (err: any) {
      console.error("[SES] Failed to send email (Is your SES_SENDER_EMAIL verified in AWS?):", err.message);
    }
  }
}
