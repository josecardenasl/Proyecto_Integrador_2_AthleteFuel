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
    const { supplementId, supplementName, intakeTimes, timezone, notes, date } = body;

    if (!supplementId || !supplementName || !intakeTimes || !Array.isArray(intakeTimes) || intakeTimes.length === 0 || !date) {
      return { statusCode: 400, body: JSON.stringify({ message: "supplementId, supplementName, date and intakeTimes are required" }) };
    }

    const schedule = {
      id: "supp_schedule_" + Date.now().toString(),
      userId: decoded.id,
      supplementId,
      supplementName,
      date,
      intakeTimes,
      timezone: timezone || "America/Bogota",
      notes: notes || "",
      createdAt: new Date().toISOString()
    };

    await dynamoDb.send(new PutCommand({
      TableName: "AthleteFuel",
      Item: schedule
    }));

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Supplement intake scheduled successfully", schedule })
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: "Error scheduling supplement intake", error: error.message }) };
  }
};
