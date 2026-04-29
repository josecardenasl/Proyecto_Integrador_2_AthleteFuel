const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
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

    const workoutId = event.pathParameters?.id;
    if (!workoutId) {
      return { statusCode: 400, body: JSON.stringify({ message: "Workout ID required" }) };
    }

    // Verify the workout belongs to this user
    const scan = await dynamoDb.send(new ScanCommand({
      TableName: "AthleteFuel",
      FilterExpression: "id = :id AND userId = :userId",
      ExpressionAttributeValues: { ":id": workoutId, ":userId": decoded.id }
    }));

    if (!scan.Items || scan.Items.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ message: "Workout not found" }) };
    }

    await dynamoDb.send(new DeleteCommand({
      TableName: "AthleteFuel",
      Key: { id: workoutId }
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Workout deleted successfully" })
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: "Error deleting workout", error: error.message }) };
  }
};
