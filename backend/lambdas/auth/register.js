const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const bcrypt = require("bcryptjs");

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://localhost:8000"
});

const dynamoDb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "All fields are required (name, email, password)"
        })
      };
    }

    if (name.trim() === "" || email.trim() === "" || password.trim() === "") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Fields cannot be empty"
        })
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid email format"
        })
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await dynamoDb.send(
      new PutCommand({
        TableName: "AthleteFuel",
        Item: {
          id: Date.now().toString(),
          name: name.trim(),
          email: email.trim(),
          password: hashedPassword
        }
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User registered successfully"
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error registering user",
        error: error.message
      })
    };
  }
};