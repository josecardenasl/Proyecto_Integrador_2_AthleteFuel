const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://localhost:8000",
  credentials: { accessKeyId: "local", secretAccessKey: "local" }
});

const dynamoDb = DynamoDBDocumentClient.from(client);

async function logActivity(userId, userName, action, details = "") {
  try {
    await dynamoDb.send(new PutCommand({
      TableName: "AthleteFuel",
      Item: {
        id: "log_" + Date.now().toString() + "_" + Math.random().toString(36).substr(2, 5),
        userId: userId || "unknown",
        userName: userName || "unknown",
        action,
        details,
        timestamp: new Date().toISOString()
      }
    }));
  } catch (e) {
    // Never fail the main operation because of logging
    console.error("Logging error:", e.message);
  }
}

module.exports = { logActivity };
