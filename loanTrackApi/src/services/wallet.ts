import {
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../config/dynamo";
import { UserInput } from "../models/user";

const TABLE_NAME = process.env.DYNAMO_USER_TABLE!;

export class WalletService {
  public async getUserById(userId: string): Promise<UserInput | null> {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { userId: userId },
    });

    const result = await docClient.send(command);
    return (result.Item as UserInput) || null;
  }

  public async updateUserFinancials(
    userId: string,
    walletBalance: number,
    usedLoanAmount: number
  ): Promise<void> {
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { userId: userId },
      UpdateExpression:
        "SET walletBalance = :walletBalance, usedLoanAmount = :usedLoanAmount",
      ExpressionAttributeValues: {
        ":walletBalance": walletBalance,
        ":usedLoanAmount": usedLoanAmount,
      },
    });

    await docClient.send(command);
  }

  public async creditWallet(
    userId: string,
    amount: number
  ): Promise<number> {
    const user = await this.getUserById(userId);

    if (!user) throw new Error("User not found");

    const updatedBalance = (user.walletBalance || 0) + amount;

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { userId: userId },
      UpdateExpression: "SET walletBalance = :walletBalance",
      ExpressionAttributeValues: {
        ":walletBalance": updatedBalance,
      },
    });

    await docClient.send(command);

    return updatedBalance;
  }
}