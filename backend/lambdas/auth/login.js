const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { logActivity } = require("../../utils/logger");
const dynamoDb = require("../../services/dynamoClient");
const SECRET = "athletefuel-secret";

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { email, password } = body;

    if (!email || !password) {
      return { statusCode: 400, body: JSON.stringify({ message: "Email and password are required" }) };
    }

    if (email.trim() === "" || password.trim() === "") {
      return { statusCode: 400, body: JSON.stringify({ message: "Fields cannot be empty" }) };
    }

    const result = await dynamoDb.send(new ScanCommand({
      TableName: "AthleteFuel",
      FilterExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email.trim() }
    }));

    if (!result.Items || result.Items.length === 0) {
      return { statusCode: 401, body: JSON.stringify({ message: "Invalid email or password" }) };
    }

    const user = result.Items[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return { statusCode: 401, body: JSON.stringify({ message: "Invalid email or password" }) };
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role || "user" },
      SECRET,
      { expiresIn: "1h" }
    );

    await logActivity(user.id, user.name, "login", `User logged in: ${user.email}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Login successful",
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role || "user" }
      })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: "Internal server error", error: error.message }) };
  }
};
