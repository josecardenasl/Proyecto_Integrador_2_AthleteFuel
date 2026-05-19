const { ScanCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const jwt = require("jsonwebtoken");
const dynamoDb = require("../../services/dynamoClient");
const SECRET = "athletefuel-secret";

exports.handler = async (event) => {
  try {
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader) return { statusCode: 401, body: JSON.stringify({ message: "Token required" }) };

    const decoded = jwt.verify(authHeader.split(" ")[1], SECRET);

    const result = await dynamoDb.send(new ScanCommand({
      TableName: "AthleteFuel",
      FilterExpression: "id = :id",
      ExpressionAttributeValues: { ":id": decoded.id }
    }));

    if (!result.Items || result.Items.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ message: "User not found" }) };
    }

    const body = JSON.parse(event.body || "{}");
    const { goals, weight, height, age, gender, timezone, notificationsEnabled, reminderMinutesBefore } = body;

    const updateParts = [];
    const expressionValues = {};

    if (goals !== undefined)                  { updateParts.push("goals = :goals");                                   expressionValues[":goals"] = goals.trim(); }
    if (weight !== undefined)                 { updateParts.push("weight = :weight");                                 expressionValues[":weight"] = Number(weight); }
    if (height !== undefined)                 { updateParts.push("height = :height");                                 expressionValues[":height"] = Number(height); }
    if (age !== undefined)                    { updateParts.push("age = :age");                                       expressionValues[":age"] = Number(age); }
    if (gender !== undefined)                 { updateParts.push("gender = :gender");                                 expressionValues[":gender"] = gender; }
    if (timezone !== undefined)               { updateParts.push("timezone = :timezone");                             expressionValues[":timezone"] = timezone; }
    if (notificationsEnabled !== undefined)   { updateParts.push("notificationsEnabled = :notificationsEnabled");     expressionValues[":notificationsEnabled"] = Boolean(notificationsEnabled); }
    if (reminderMinutesBefore !== undefined)  { updateParts.push("reminderMinutesBefore = :reminderMinutesBefore");   expressionValues[":reminderMinutesBefore"] = Number(reminderMinutesBefore); }

    if (updateParts.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ message: "No fields to update" }) };
    }

    await dynamoDb.send(new UpdateCommand({
      TableName: "AthleteFuel",
      Key: { id: decoded.id },
      UpdateExpression: "SET " + updateParts.join(", "),
      ExpressionAttributeValues: expressionValues
    }));

    return { statusCode: 200, body: JSON.stringify({ message: "Profile updated successfully" }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: "Error updating profile", error: error.message }) };
  }
};
