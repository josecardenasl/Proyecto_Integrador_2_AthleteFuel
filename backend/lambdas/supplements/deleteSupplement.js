const { DeleteCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
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

    const supplementId = event.pathParameters?.id;
    if (!supplementId) {
      return { statusCode: 400, body: JSON.stringify({ message: "Supplement ID required" }) };
    }

    // Verify the supplement belongs to this user
    const scan = await dynamoDb.send(new ScanCommand({
      TableName: "AthleteFuel",
      FilterExpression: "id = :id AND userId = :userId",
      ExpressionAttributeValues: { ":id": supplementId, ":userId": decoded.id }
    }));

    if (!scan.Items || scan.Items.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ message: "Supplement not found" }) };
    }

    await dynamoDb.send(new DeleteCommand({
      TableName: "AthleteFuel",
      Key: { id: supplementId }
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Supplement deleted successfully" })
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: "Error deleting supplement", error: error.message }) };
  }
};
