const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const dynamoDb = require("../services/dynamoClient");

async function logActivity(userId, userName, action, details = "") {
  try {
    await dynamoDb.send(new PutCommand({
      TableName: "AthleteFuel",
      Item: {
        id: "log_" + Date.now().toString() + "_" + Math.random().toString(36).substr(2, 5),
        userId: userId || "unknown",
        userName: userName || "unknown",
        action,
        details,
        timestamp: new Date().toISOString()
      }
    }));
  } catch (e) {
    // Never fail the main operation because of logging
    console.error("Logging error:", e.message);
  }
}

module.exports = { logActivity };
