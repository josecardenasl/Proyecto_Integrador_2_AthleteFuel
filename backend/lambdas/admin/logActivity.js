const jwt = require("jsonwebtoken");
const { logActivity } = require("../../utils/logger");

const SECRET = "athletefuel-secret";

exports.handler = async (event) => {
  try {
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader) return { statusCode: 401, body: JSON.stringify({ message: "Token required" }) };

    const decoded = jwt.verify(authHeader.split(" ")[1], SECRET);

    const body = JSON.parse(event.body || "{}");
    const { action, details } = body;

    if (!action) return { statusCode: 400, body: JSON.stringify({ message: "Action is required" }) };

    await logActivity(decoded.id, decoded.name, action, details || "");

    return { statusCode: 201, body: JSON.stringify({ message: "Activity logged" }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: "Error logging activity", error: error.message }) };
  }
};
