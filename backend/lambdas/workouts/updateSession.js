const { UpdateCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const jwt = require("jsonwebtoken");
const dynamoDb = require("../../services/dynamoClient");
const SECRET = "athletefuel-secret";

exports.handler = async (event) => {
  try {
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader) return { statusCode: 401, body: JSON.stringify({ message: "Token required" }) };

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, SECRET);

    const sessionId = event.pathParameters?.id;
    if (!sessionId) return { statusCode: 400, body: JSON.stringify({ message: "Session ID required" }) };

    const scan = await dynamoDb.send(new ScanCommand({
      TableName: "AthleteFuel",
      FilterExpression: "id = :id AND userId = :userId",
      ExpressionAttributeValues: { ":id": sessionId, ":userId": decoded.id }
    }));

    if (!scan.Items || scan.Items.length === 0)
      return { statusCode: 404, body: JSON.stringify({ message: "Session not found" }) };

    const body = JSON.parse(event.body || "{}");
    const { date, time, notes } = body;

    if (!date || !time) return { statusCode: 400, body: JSON.stringify({ message: "Date and time are required" }) };

    await dynamoDb.send(new UpdateCommand({
      TableName: "AthleteFuel",
      Key: { id: sessionId },
      UpdateExpression: "SET #d = :date, #t = :time, notes = :notes, updatedAt = :updatedAt",
      ExpressionAttributeNames: { "#d": "date", "#t": "time" },
      ExpressionAttributeValues: {
        ":date": date,
        ":time": time,
        ":notes": notes || "",
        ":updatedAt": new Date().toISOString()
      }
    }));

    return { statusCode: 200, body: JSON.stringify({ message: "Session updated successfully" }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: "Error updating session", error: error.message }) };
  }
};
