import { PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../config/dynamo";
import { User } from "../models/user";

const TABLE_NAME = process.env.DYNAMO_USER_TABLE || "userDetails";
const USER_PARTITION_KEY = process.env.DYNAMO_USER_PK || "userId";

const keyById = (id: string) => ({ [USER_PARTITION_KEY]: id });

export const createUser = async (user: User): Promise<User> => {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      ...user,
      [USER_PARTITION_KEY]: user.id,
    },
    ConditionExpression: "attribute_not_exists(#pk)",
    ExpressionAttributeNames: {
      "#pk": USER_PARTITION_KEY,
    },
  };

  await docClient.send(new PutCommand(params));
  return user;
};

export const getUserById = async (id: string): Promise<User | null> => {
  const params = {
    TableName: TABLE_NAME,
    Key: keyById(id),
  };

  const result = await docClient.send(new GetCommand(params));
  return result.Item ? (result.Item as User) : null;
};

export const updateUserById = async (
  id: string,
  payload: {
    owner: string;
    email: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    updatedAt: string;
    loanLimit?: number;
    usedLoanAmount?: number;
  }
): Promise<User | null> => {
  const updateParts = [
    "owner = :owner",
    "email = :email",
    "phoneNumber = :phoneNumber",
    "firstName = :firstName",
    "lastName = :lastName",
    "updatedAt = :updatedAt",
  ];
  const expressionAttributeValues: Record<string, unknown> = {
    ":owner": payload.owner,
    ":email": payload.email,
    ":phoneNumber": payload.phoneNumber,
    ":firstName": payload.firstName,
    ":lastName": payload.lastName,
    ":updatedAt": payload.updatedAt,
  };

  if (typeof payload.loanLimit === "number") {
    updateParts.push("loanLimit = :loanLimit");
    expressionAttributeValues[":loanLimit"] = payload.loanLimit;
  }

  const params = {
    TableName: TABLE_NAME,
    Key: keyById(id),
    UpdateExpression: `SET ${updateParts.join(", ")}`,
    ExpressionAttributeValues: expressionAttributeValues,
    ConditionExpression: "attribute_exists(#pk)",
    ExpressionAttributeNames: {
      "#pk": USER_PARTITION_KEY,
    },
    ReturnValues: "ALL_NEW" as const,
  };

  try {
    const result = await docClient.send(new UpdateCommand(params));
    return result.Attributes ? (result.Attributes as User) : null;
  } catch (error) {
    if ((error as { name?: string }).name === "ConditionalCheckFailedException") {
      return null;
    }
    throw error;
  }
};
