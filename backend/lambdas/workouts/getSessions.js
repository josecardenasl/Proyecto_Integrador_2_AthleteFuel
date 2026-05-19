const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const jwt = require("jsonwebtoken");
const dynamoDb = require("../../services/dynamoClient");
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
