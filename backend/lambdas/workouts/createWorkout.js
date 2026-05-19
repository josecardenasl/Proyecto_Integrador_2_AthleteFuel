const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const jwt = require("jsonwebtoken");
const dynamoDb = require("../../services/dynamoClient");

const SECRET = "athletefuel-secret";

exports.handler = async (event) => {
  try {
    const authHeader = event.headers.Authorization || event.headers.authorization;

    if (!authHeader) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Token required" })
      };
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, SECRET);

    const body = JSON.parse(event.body || "{}");
    const { name, type, duration, notes } = body;

    if (!name || !duration) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Name and duration are required" })
      };
    }

    const workout = {
      id: "workout_" + Date.now().toString(),
      userId: decoded.id,
      name: name.trim(),
      type: type || "Otro",
      duration: Number(duration),
      notes: notes || "",
      createdAt: new Date().toISOString()
    };

    await dynamoDb.send(
      new PutCommand({
        TableName: "AthleteFuel",
        Item: workout
      })
    );

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Workout created successfully",
        workout
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error creating workout",
        error: error.message
      })
    };
  }
};
