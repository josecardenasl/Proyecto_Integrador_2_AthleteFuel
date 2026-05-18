const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const jwt = require("jsonwebtoken");
const { logActivity } = require("../../utils/logger");

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

    const userId = event.pathParameters?.id;
    if (!userId) return { statusCode: 400, body: JSON.stringify({ message: "User ID required" }) };

    if (userId === decoded.id) return { statusCode: 400, body: JSON.stringify({ message: "Cannot delete your own account" }) };

    const scan = await dynamoDb.send(new ScanCommand({
      TableName: "AthleteFuel",
      FilterExpression: "id = :id",
      ExpressionAttributeValues: { ":id": userId }
    }));

    if (!scan.Items || scan.Items.length === 0)
      return { statusCode: 404, body: JSON.stringify({ message: "User not found" }) };

    const targetUser = scan.Items[0];

    await dynamoDb.send(new DeleteCommand({ TableName: "AthleteFuel", Key: { id: userId } }));

    await logActivity(decoded.id, decoded.name, "delete_user", `Deleted user: ${targetUser.email}`);

    return { statusCode: 200, body: JSON.stringify({ message: "User deleted successfully" }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: "Error deleting user", error: error.message }) };
  }
};
