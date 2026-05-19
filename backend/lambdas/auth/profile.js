const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const jwt = require("jsonwebtoken");
const dynamoDb = require("../../services/dynamoClient");
const SECRET = "athletefuel-secret";

exports.handler = async (event) => {
  try {
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader) return { statusCode: 401, body: JSON.stringify({ message: "Token required" }) };

    const decoded = jwt.verify(authHeader.split(" ")[1], SECRET);

    const result = await dynamoDb.send(new ScanCommand({
      TableName: "AthleteFuel",
      FilterExpression: "id = :id",
      ExpressionAttributeValues: { ":id": decoded.id }
    }));

    if (!result.Items || result.Items.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ message: "User not found" }) };
    }

    const user = result.Items[0];
    const { password, ...safeUser } = user;

    return { statusCode: 200, body: JSON.stringify({ message: "Profile retrieved", user: safeUser }) };
  } catch (error) {
    return { statusCode: 401, body: JSON.stringify({ message: "Invalid token" }) };
  }
};
