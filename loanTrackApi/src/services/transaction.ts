import {
  PutCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { docClient } from "../config/dynamo";
import { Transaction } from "../models/transaction";

const TABLE_NAME = process.env.DYNAMO_TRANSACTION_TABLE!;

const OWNER_INDEX_NAME = process.env.DYNAMO_OWNER_INDEX || "owner";
const OWNER_FIELD = process.env.DYNAMO_OWNER_FIELD || "owner";

class TransactionServices {
  owner: string;
  transactionId: string;
  loanId?: string;
  amount: number;
  type:
    | "PAYMENT"
    | "DISBURSEMENT"
    | "INTEREST"
    | "FEE"
    | "REFUND"
    | "CHARGE"
    | "ADJUSTMENT"
    | "WALLET_TRANSFER";
  date: string;
  status?: "SUCCESS" | "FAILED" | "PENDING";
  note?: string;

  private static indexesChecked = false;
  private static hasOwnerIndex = false;
  private static warningShown = false;

  constructor(transaction: Transaction) {
    this.owner = transaction.owner;
    this.transactionId = transaction.transactionId;
    this.loanId = transaction.loanId;
    this.amount = transaction.amount;
    this.type = transaction.type;
    this.date = transaction.date;
    this.status = transaction.status;
    this.note = transaction.note;
  }

  // ✅ Load Index Info
  private static async loadIndexes() {
    if (this.indexesChecked) return;

    try {
      const result = await docClient.send(
        new DescribeTableCommand({ TableName: TABLE_NAME })
      );

      const indexNames =
        result.Table?.GlobalSecondaryIndexes?.map(
          (index) => index.IndexName
        ) ?? [];

      this.hasOwnerIndex = indexNames.includes(OWNER_INDEX_NAME);
    } catch (error) {
      console.warn(
        `[loanTrack] Unable to inspect indexes for ${TABLE_NAME}`
      );
    } finally {
      this.indexesChecked = true;
    }
  }

  // ✅ Create Transaction
  async createTransaction() {
    const params = {
      TableName: TABLE_NAME,
      Item: {
        owner: this.owner,
        transactionId: this.transactionId,
        loanId: this.loanId,
        amount: this.amount,
        type: this.type,
        date: this.date,
        status: this.status,
        note: this.note,
      },
    };

    await docClient.send(new PutCommand(params));
    return params.Item;
  }

  // ✅ Query using index
  private static async queryByOwner(owner: string) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: OWNER_INDEX_NAME,
      KeyConditionExpression: `#owner = :owner`,
      ExpressionAttributeNames: {
        "#owner": OWNER_FIELD,
      },
      ExpressionAttributeValues: {
        ":owner": owner,
      },
    };

    const result = await docClient.send(new QueryCommand(params));
    return result.Items;
  }

  // ✅ Get Transactions by Owner
  static async getTransactionsByOwner(owner: string) {
    await this.loadIndexes();

    if (this.hasOwnerIndex) {
      return this.queryByOwner(owner);
    }

    // ⚠️ fallback
    if (!this.warningShown) {
      console.info(
        `[loanTrack] ${TABLE_NAME} has no owner index; using scan for ${owner}`
      );
      this.warningShown = true;
    }

    const params = {
      TableName: TABLE_NAME,
      FilterExpression: "#owner = :owner",
      ExpressionAttributeNames: {
        "#owner": "owner",
      },
      ExpressionAttributeValues: {
        ":owner": owner,
      },
    };

    const result = await docClient.send(new ScanCommand(params));
    return result.Items;
  }
}

export default TransactionServices;
