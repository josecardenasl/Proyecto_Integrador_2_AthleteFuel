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
    if (!authHeader) return { statusCode: 401, body: JSON.stringify({ message: "Token required" }) };

    const decoded = jwt.verify(authHeader.split(" ")[1], SECRET);
    if (decoded.role !== "admin") return { statusCode: 403, body: JSON.stringify({ message: "Admin access required" }) };

    const result = await dynamoDb.send(new ScanCommand({
      TableName: "AthleteFuel",
      FilterExpression: "begins_with(id, :prefix)",
      ExpressionAttributeValues: { ":prefix": "user_" }
    }));

    const users = (result.Items || []).map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role || "user",
      createdAt: u.createdAt || null
    }));

    return { statusCode: 200, body: JSON.stringify(users) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: "Error fetching users", error: error.message }) };
  }
};
