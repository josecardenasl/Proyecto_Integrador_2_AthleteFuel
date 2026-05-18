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
    const { name, type, duration, notes } = JSON.parse(event.body || "{}");

    if (!name || !type || !duration) {
      return { statusCode: 400, body: JSON.stringify({ message: "name, type and duration are required" }) };
    }

    const workout = {
      id: "workout_" + Date.now(),
      userId: targetUserId,
      name,
      type,
      duration: Number(duration),
      notes: notes || "",
      assignedBy: decoded.id,
      createdAt: new Date().toISOString(),
    };

    await dynamoDb.send(new PutCommand({ TableName: "AthleteFuel", Item: workout }));
    await logActivity(decoded.id, decoded.name, "ASSIGN_WORKOUT", `${name} → usuario ${targetUserId}`);

    return { statusCode: 201, body: JSON.stringify({ workout }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
  }
};
