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

    const body = JSON.parse(event.body || "{}");
    const { name, dose, timing, notes } = body;

    if (!name || !dose) {
      return { statusCode: 400, body: JSON.stringify({ message: "Name and dose are required" }) };
    }

    await dynamoDb.send(new UpdateCommand({
      TableName: "AthleteFuel",
      Key: { id: supplementId },
      UpdateExpression: "SET #n = :name, dose = :dose, timing = :timing, notes = :notes, updatedAt = :updatedAt",
      ExpressionAttributeNames: { "#n": "name" },
      ExpressionAttributeValues: {
        ":name": name.trim(),
        ":dose": dose.trim(),
        ":timing": timing || "Post-entrenamiento",
        ":notes": notes || "",
        ":updatedAt": new Date().toISOString()
      }
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Supplement updated successfully" })
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: "Error updating supplement", error: error.message }) };
  }
};
