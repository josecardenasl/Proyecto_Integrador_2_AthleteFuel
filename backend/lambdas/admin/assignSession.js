const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const jwt = require("jsonwebtoken");
const { logActivity } = require("../../utils/logger");
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
    const { workoutId, workoutName, date, time, timezone, notes } = JSON.parse(event.body || "{}");

    if (!workoutId || !date || !time) {
      return { statusCode: 400, body: JSON.stringify({ message: "workoutId, date and time are required" }) };
    }

    const session = {
      id: "session_" + Date.now(),
      userId: targetUserId,
      workoutId,
      workoutName: workoutName || "Entrenamiento",
      date,
      time,
      timezone: timezone || "America/Bogota",
      notes: notes || "",
      assignedBy: decoded.id,
      createdAt: new Date().toISOString(),
    };

    await dynamoDb.send(new PutCommand({ TableName: "AthleteFuel", Item: session }));
    await logActivity(decoded.id, decoded.name, "ASSIGN_SESSION", `${workoutName} — ${date} ${time} → usuario ${targetUserId}`);

    return { statusCode: 201, body: JSON.stringify({ session }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
  }
};
