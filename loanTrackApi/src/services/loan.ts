import { PutCommand, GetCommand, ScanCommand, QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../config/dynamo";
import { Loan } from "../models/loan";

const TABLE_NAME = process.env.DYNAMO_TABLE!;
const USER_ID_INDEX_NAME = process.env.DYNAMO_USER_ID_INDEX || "userId";

export const createLoan = async (loan: Loan) => {
  const params = {
    TableName: TABLE_NAME,
    Item: loan,
  };

  await docClient.send(new PutCommand(params));
  return loan;
};

export const getLoan = async (loanId: string): Promise<Loan | null> => {
  const params = {
    TableName: TABLE_NAME,
    Key: { loanId },
  };

  const result = await docClient.send(new GetCommand(params));
  return result.Item ? (result.Item as Loan) : null;
};

export const getAllLoans = async () => {
  const params = {
    TableName: TABLE_NAME,
  };

  const result = await docClient.send(new ScanCommand(params));
  return result.Items;
};

export const getLoansByUserId = async (userId: string) => {
  const params = {
    TableName: TABLE_NAME,
    IndexName: USER_ID_INDEX_NAME,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
  };

  try {
    const result = await docClient.send(new QueryCommand(params));
    return result.Items;
  } catch (error) {
    const err = error as { name?: string; message?: string };
    const isMissingIndex =
      err.name === "ValidationException" ||
      err.message?.includes(USER_ID_INDEX_NAME) ||
      err.message?.includes("Index not found");

    if (isMissingIndex) {
      console.warn(
        `[loanTrack] ${USER_ID_INDEX_NAME} missing or invalid. Falling back to table scan for user ${userId}. This will be slow; add a DynamoDB GSI named ${USER_ID_INDEX_NAME} or set DYNAMO_USER_ID_INDEX to the correct GSI name.`
      );
      const fallbackParams = {
        TableName: TABLE_NAME,
        FilterExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      };
      const result = await docClient.send(new ScanCommand(fallbackParams));
      return result.Items;
    }
    throw error;
  }
};

export const deleteLoan = async (loanId: string) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { loanId },
  };

  await docClient.send(new DeleteCommand(params));
};