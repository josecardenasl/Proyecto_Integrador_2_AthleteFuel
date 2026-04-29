const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
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

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, SECRET);

    const scheduleId = event.pathParameters?.id;
    if (!scheduleId) return { statusCode: 400, body: JSON.stringify({ message: "Schedule ID required" }) };

    const scan = await dynamoDb.send(new ScanCommand({
      TableName: "AthleteFuel",
      FilterExpression: "id = :id AND userId = :userId",
      ExpressionAttributeValues: { ":id": scheduleId, ":userId": decoded.id }
    }));

    if (!scan.Items || scan.Items.length === 0)
      return { statusCode: 404, body: JSON.stringify({ message: "Schedule not found" }) };

    const body = JSON.parse(event.body || "{}");
    const { date, intakeTimes, notes } = body;

    if (!date || !intakeTimes || !Array.isArray(intakeTimes) || intakeTimes.length === 0)
      return { statusCode: 400, body: JSON.stringify({ message: "Date and intakeTimes are required" }) };

    await dynamoDb.send(new UpdateCommand({
      TableName: "AthleteFuel",
      Key: { id: scheduleId },
      UpdateExpression: "SET #d = :date, intakeTimes = :intakeTimes, notes = :notes, updatedAt = :updatedAt",
      ExpressionAttributeNames: { "#d": "date" },
      ExpressionAttributeValues: {
        ":date": date,
        ":intakeTimes": intakeTimes,
        ":notes": notes || "",
        ":updatedAt": new Date().toISOString()
      }
    }));

    return { statusCode: 200, body: JSON.stringify({ message: "Schedule updated successfully" }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: "Error updating schedule", error: error.message }) };
  }
};
