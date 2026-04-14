import { PutCommand, GetCommand, ScanCommand, QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { docClient } from "../config/dynamo";
import { Loan } from "../models/loan";

const TABLE_NAME = process.env.DYNAMO_TABLE!;
const USER_ID_INDEX_NAME = process.env.DYNAMO_USER_ID_INDEX || "userId";
const USER_ID_FIELD = process.env.DYNAMO_USER_ID_FIELD || "userId";
const OWNER_INDEX_NAME = process.env.DYNAMO_OWNER_INDEX || "owner";
const OWNER_FIELD = process.env.DYNAMO_OWNER_FIELD || "owner";

let loanIndexesChecked = false;
let hasUserIdIndex = false;
let hasOwnerIndex = false;
let loanIndexWarningShown = false;

const loadLoanIndexes = async () => {
  if (loanIndexesChecked) return;

  try {
    const result = await docClient.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    const indexNames = result.Table?.GlobalSecondaryIndexes?.map((index) => index.IndexName) ?? [];
    hasUserIdIndex = indexNames.includes(USER_ID_INDEX_NAME);
    hasOwnerIndex = indexNames.includes(OWNER_INDEX_NAME);
  } catch (error) {
    console.warn(
      `[loanTrack] Unable to inspect DynamoDB table indexes for ${TABLE_NAME}; falling back to table scan when needed.`
    );
  } finally {
    loanIndexesChecked = true;
  }
};

const queryLoanIndex = async (indexName: string, keyField: string, userId: string) => {
  const params = {
    TableName: TABLE_NAME,
    IndexName: indexName,
    KeyConditionExpression: `${keyField} = :userId`,
    ExpressionAttributeValues: {
      ":userId": userId,
    },
  };

  const result = await docClient.send(new QueryCommand(params));
  return result.Items;
};

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
  await loadLoanIndexes();

  if (hasUserIdIndex) {
    return queryLoanIndex(USER_ID_INDEX_NAME, USER_ID_FIELD, userId);
  }

  if (hasOwnerIndex) {
    return queryLoanIndex(OWNER_INDEX_NAME, OWNER_FIELD, userId);
  }

  if (!loanIndexWarningShown) {
    console.info(
      `[loanTrack] ${TABLE_NAME} has no loan user GSIs; using table scan to fetch loans for user ${userId}. Add a DynamoDB GSI on '${USER_ID_FIELD}' or '${OWNER_FIELD}' for better performance.`
    );
    loanIndexWarningShown = true;
  }

  const fallbackParams = {
    TableName: TABLE_NAME,
    FilterExpression: "userId = :userId OR owner = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
  };
  const result = await docClient.send(new ScanCommand(fallbackParams));
  return result.Items;
};

export const deleteLoan = async (loanId: string) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { loanId },
  };

  await docClient.send(new DeleteCommand(params));
};