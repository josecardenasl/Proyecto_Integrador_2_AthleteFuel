const { ScanCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { Resend } = require("resend");
const dynamoDb = require("../../services/dynamoClient");
const resend = new Resend(process.env.RESEND_API_KEY);

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

    await resend.emails.send({
      from: "AthleteFuel <onboarding@resend.dev>",
      to: email.trim(),
      subject: "Your AthleteFuel password reset code",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #111;">Password reset</h2>
          <p style="color: #555;">
            Use the following code to reset your AthleteFuel password.
            This code expires in <strong>10 minutes</strong>.
          </p>
          <div style="
            background: #f4f4f4;
            border-radius: 8px;
            padding: 24px;
            text-align: center;
            margin: 24px 0;
          ">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #ef4444;">
              ${otp}
            </span>
          </div>
          <p style="color: #999; font-size: 13px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "If that email exists, a code has been sent.",
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