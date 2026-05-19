const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const jwt = require("jsonwebtoken");
const dynamoDb = require("../../services/dynamoClient");
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
      ExpressionAttributeValues: { ":prefix": "log_" }
    }));

    const logs = (result.Items || []).sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    return { statusCode: 200, body: JSON.stringify(logs) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: "Error fetching logs", error: error.message }) };
  }
};
