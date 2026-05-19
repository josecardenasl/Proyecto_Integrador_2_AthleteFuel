const { DeleteCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const jwt = require("jsonwebtoken");
const dynamoDb = require("../../services/dynamoClient");
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

    await dynamoDb.send(new DeleteCommand({ TableName: "AthleteFuel", Key: { id: scheduleId } }));

    return { statusCode: 200, body: JSON.stringify({ message: "Schedule deleted successfully" }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: "Error deleting schedule", error: error.message }) };
  }
};
