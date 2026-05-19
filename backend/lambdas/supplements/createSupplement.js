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
    const { name, dose, timing, notes } = body;

    if (!name || !dose) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Name and dose are required" })
      };
    }

    const supplement = {
      id: "supplement_" + Date.now().toString(),
      userId: decoded.id,
      name: name.trim(),
      dose: dose.trim(),
      timing: timing || "Post-entrenamiento",
      notes: notes || "",
      createdAt: new Date().toISOString()
    };

    await dynamoDb.send(
      new PutCommand({
        TableName: "AthleteFuel",
        Item: supplement
      })
    );

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Supplement created successfully",
        supplement
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error creating supplement",
        error: error.message
      })
    };
  }
};