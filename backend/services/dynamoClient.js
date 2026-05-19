const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const isOffline = process.env.IS_OFFLINE;

const client = new DynamoDBClient({
  region: "us-east-1",
  ...(isOffline && {
    endpoint: "http://localhost:8000",
    credentials: { accessKeyId: "local", secretAccessKey: "local" },
  }),
});

const dynamoDb = DynamoDBDocumentClient.from(client);

module.exports = dynamoDb;