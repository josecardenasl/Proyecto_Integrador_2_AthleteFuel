const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://localhost:8000",
  credentials: { accessKeyId: "local", secretAccessKey: "local" },
});

const dynamoDb = DynamoDBDocumentClient.from(client);

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { email } = body;

    if (!email || email.trim() === "") {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Email is required" }),
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
        statusCode: 200,
        body: JSON.stringify({
          message: "If that email exists, a code has been sent.",
        }),
      };
    }

    const user = result.Items[0];
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    await dynamoDb.send(
      new UpdateCommand({
        TableName: "AthleteFuel",
        Key: { id: user.id },
        UpdateExpression: "SET resetOtp = :otp, otpExpires = :exp",
        ExpressionAttributeValues: {
          ":otp": otp,
          ":exp": otpExpires,
        },
      })
    );

    console.log(`OTP for ${email}: ${otp}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "If that email exists, a code has been sent.",
        devOtp: otp,
      }),
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