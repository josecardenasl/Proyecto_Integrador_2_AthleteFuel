const { PutCommand } = require("@aws-sdk/lib-dynamodb");
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

    const body = JSON.parse(event.body || "{}");
    const { workoutId, workoutName, date, time, timezone, notes } = body;

    if (!workoutId || !workoutName || !date || !time) {
      return { statusCode: 400, body: JSON.stringify({ message: "workoutId, workoutName, date and time are required" }) };
    }

    const session = {
      id: "session_" + Date.now().toString(),
      userId: decoded.id,
      workoutId,
      workoutName,
      date,
      time,
      timezone: timezone || "America/Bogota",
      notes: notes || "",
      createdAt: new Date().toISOString()
    };

    await dynamoDb.send(new PutCommand({
      TableName: "AthleteFuel",
      Item: session
    }));

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Session scheduled successfully", session })
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: "Error scheduling session", error: error.message }) };
  }
};
