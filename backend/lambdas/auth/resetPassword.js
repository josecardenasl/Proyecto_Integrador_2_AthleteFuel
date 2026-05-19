const { ScanCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const bcrypt = require("bcryptjs");
const dynamoDb = require("../../services/dynamoClient");

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Email, OTP and new password are required" }),
      };
    }

    if (newPassword.trim().length < 6) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Password must be at least 6 characters" }),
      };
    }

    const result = await dynamoDb.send(
      new ScanCommand({
        TableName: "AthleteFuel",
        FilterExpression: "email = :email",
        ExpressionAttributeValues: { ":email": email.trim() },
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid code or email" }),
      };
    }

    const user = result.Items[0];

    if (!user.resetOtp || !user.otpExpires) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "No reset code found. Request a new one." }),
      };
    }

    if (Date.now() > user.otpExpires) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "The code has expired. Request a new one." }),
      };
    }

    if (user.resetOtp !== otp.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid code" }),
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await dynamoDb.send(
      new UpdateCommand({
        TableName: "AthleteFuel",
        Key: { id: user.id },
        UpdateExpression:
          "SET #pw = :pw REMOVE resetOtp, otpExpires",
        ExpressionAttributeNames: { "#pw": "password" },
        ExpressionAttributeValues: { ":pw": hashedPassword },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Password updated successfully" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
        error: error.message,
      }),
    };
  }
};