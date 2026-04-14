const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { DynamoDBClient, DescribeTableCommand, UpdateTableCommand } = require('@aws-sdk/client-dynamodb');

const envPath = path.join(__dirname, '..', '.env');
const env = dotenv.parse(fs.readFileSync(envPath));

const TABLE_NAME = env.DYNAMO_TABLE;
const INDEX_NAME = env.DYNAMO_USER_ID_INDEX || 'userId';
const ATTRIBUTE_NAME = env.DYNAMO_USER_ID_FIELD || 'userId';

if (!TABLE_NAME) {
  console.error('Missing DYNAMO_TABLE in .env');
  process.exit(1);
}

const client = new DynamoDBClient({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

(async () => {
  try {
    const describe = await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    const existingIndexes = describe.Table?.GlobalSecondaryIndexes?.map((item) => item.IndexName) || [];

    if (existingIndexes.includes(INDEX_NAME)) {
      console.log(`Index '${INDEX_NAME}' already exists on table '${TABLE_NAME}'.`);
      return;
    }

    console.log(`Creating GSI '${INDEX_NAME}' on table '${TABLE_NAME}'...`);

    const updateResponse = await client.send(
      new UpdateTableCommand({
        TableName: TABLE_NAME,
        AttributeDefinitions: [
          { AttributeName: ATTRIBUTE_NAME, AttributeType: 'S' },
        ],
        GlobalSecondaryIndexUpdates: [
          {
            Create: {
              IndexName: INDEX_NAME,
              KeySchema: [{ AttributeName: ATTRIBUTE_NAME, KeyType: 'HASH' }],
              Projection: { ProjectionType: 'ALL' },
            },
          },
        ],
      })
    );

    console.log('UpdateTable response status:', updateResponse.TableDescription?.TableStatus);
    console.log(`GSI '${INDEX_NAME}' creation started. It may take a few minutes to become ACTIVE.`);
  } catch (error) {
    console.error('Failed to create loan GSI:', error);
    process.exit(2);
  }
})();
