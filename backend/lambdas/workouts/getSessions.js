const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const jwt = require("jsonwebtoken");

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://localhost:8000",
  credentials: { accessKeyId: "local", secretAccessKey: "local" }
});

const dynamoDb = DynamoDBDocumentClient.from(client);
const SECRET = "athletefuel-secret";

exports.handler = async (event) => {
  try {
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader) {
      return { statusCode: 401, body: JSON.stringify({ message: "Token required" }) };
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, SECRET);

    const result = await dynamoDb.send(new ScanCommand({
      TableName: "AthleteFuel",
      FilterExpression: "userId = :userId AND begins_with(id, :prefix)",
      ExpressionAttributeValues: {
        ":userId": decoded.id,
        ":prefix": "session_"
      }
    }));

    const sessions = (result.Items || []).sort((a, b) => a.date.localeCompare(b.date));

    return {
      statusCode: 200,
      body: JSON.stringify(sessions)
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: "Error retrieving sessions", error: error.message }) };
  }
};
