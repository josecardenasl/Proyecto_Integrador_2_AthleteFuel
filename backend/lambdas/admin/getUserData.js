const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const jwt = require("jsonwebtoken");
const dynamoDb = require("../../services/dynamoClient");
const SECRET = "athletefuel-secret";

exports.handler = async (event) => {
  try {
    const token = (event.headers?.Authorization || event.headers?.authorization || "").replace("Bearer ", "");
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== "admin") {
      return { statusCode: 403, body: JSON.stringify({ message: "Forbidden" }) };
    }

    const targetUserId = event.pathParameters?.id;
    if (!targetUserId) {
      return { statusCode: 400, body: JSON.stringify({ message: "User ID is required" }) };
    }

    const scan = async (prefix) => {
      const result = await dynamoDb.send(new ScanCommand({
        TableName: "AthleteFuel",
        FilterExpression: "userId = :uid AND begins_with(id, :prefix)",
        ExpressionAttributeValues: { ":uid": targetUserId, ":prefix": prefix },
      }));
      return result.Items || [];
    };

    const [workouts, sessions, supplements, intakeSchedules] = await Promise.all([
      scan("workout_"),
      scan("session_"),
      scan("supplement_"),
      scan("supp_schedule_"),
    ]);

    return {
      statusCode: 200,
      body: JSON.stringify({ workouts, sessions, supplements, intakeSchedules }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
  }
};
