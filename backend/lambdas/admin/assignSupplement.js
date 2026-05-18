const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const jwt = require("jsonwebtoken");
const { logActivity } = require("../../utils/logger");

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://localhost:8000",
  credentials: { accessKeyId: "local", secretAccessKey: "local" },
});
const dynamoDb = DynamoDBDocumentClient.from(client);
const SECRET = "athletefuel-secret";

exports.handler = async (event) => {
  try {
    const token = (event.headers?.Authorization || event.headers?.authorization || "").replace("Bearer ", "");
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== "admin") {
      return { statusCode: 403, body: JSON.stringify({ message: "Forbidden" }) };
    }

    const targetUserId = event.pathParameters?.id;
    const { name, dose, timing, notes } = JSON.parse(event.body || "{}");

    if (!name || !dose || !timing) {
      return { statusCode: 400, body: JSON.stringify({ message: "name, dose and timing are required" }) };
    }

    const supplement = {
      id: "supplement_" + Date.now(),
      userId: targetUserId,
      name,
      dose,
      timing,
      notes: notes || "",
      assignedBy: decoded.id,
      createdAt: new Date().toISOString(),
    };

    await dynamoDb.send(new PutCommand({ TableName: "AthleteFuel", Item: supplement }));
    await logActivity(decoded.id, decoded.name, "ASSIGN_SUPPLEMENT", `${name} → usuario ${targetUserId}`);

    return { statusCode: 201, body: JSON.stringify({ supplement }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
  }
};
