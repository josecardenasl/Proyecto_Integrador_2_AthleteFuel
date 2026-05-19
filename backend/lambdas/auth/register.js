const { PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const bcrypt = require("bcryptjs");
const { logActivity } = require("../../utils/logger");
const dynamoDb = require("../../services/dynamoClient");

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return { statusCode: 400, body: JSON.stringify({ message: "All fields are required (name, email, password)" }) };
    }

    if (name.trim() === "" || email.trim() === "" || password.trim() === "") {
      return { statusCode: 400, body: JSON.stringify({ message: "Fields cannot be empty" }) };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { statusCode: 400, body: JSON.stringify({ message: "Invalid email format" }) };
    }

    const existing = await dynamoDb.send(new ScanCommand({
      TableName: "AthleteFuel",
      FilterExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email.trim() }
    }));

    if (existing.Items && existing.Items.length > 0) {
      return { statusCode: 409, body: JSON.stringify({ message: "Email already registered" }) };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = "user_" + Date.now().toString();

    await dynamoDb.send(new PutCommand({
      TableName: "AthleteFuel",
      Item: {
        id: userId,
        name: name.trim(),
        email: email.trim(),
        password: hashedPassword,
        role: "user",
        createdAt: new Date().toISOString()
      }
    }));

    await logActivity(userId, name.trim(), "register", `New user registered: ${email.trim()}`);

    return { statusCode: 200, body: JSON.stringify({ message: "User registered successfully" }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: "Error registering user", error: error.message }) };
  }
};
