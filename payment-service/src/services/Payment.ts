import { PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../config/db";
import { Transaction } from "../models/transaction";

const TABLE_NAME = process.env.DYNAMO_TABLE_NAME!;

export class PaymentService {
  async createTransaction(data: Transaction): Promise<Transaction> {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: data,
    });

    await ddbDocClient.send(command);
    return data;
  }

  async getTransactionById(
    transactionId: string
  ): Promise<Transaction | null> {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { transactionId },
    });
    const result = await ddbDocClient.send(command);
    return (result.Item as Transaction) || null;
  }

  async updateTransactionStatus(
    transactionId: string,
    status: Transaction["status"]
  ): Promise<Transaction | null> {
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { transactionId },
      UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": status,
        ":updatedAt": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    });

    const result = await ddbDocClient.send(command);
    return result.Attributes as Transaction;
  }
}