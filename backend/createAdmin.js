/**
 * Script to create an admin user in DynamoDB.
 * Run from the backend folder while DynamoDB Local is running:
 *
 *   node createAdmin.js
 *
 * Edit the credentials below before running.
 */

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const bcrypt = require("bcryptjs");

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://localhost:8000",
  credentials: { accessKeyId: "local", secretAccessKey: "local" }
});

const dynamoDb = DynamoDBDocumentClient.from(client);

// ── Edit these values ─────────────────────────────────────────────────────────
const ADMIN_NAME     = "Admin";
const ADMIN_EMAIL    = "admin@athletefuel.com";
const ADMIN_PASSWORD = "Admin1234!";
// ─────────────────────────────────────────────────────────────────────────────

async function createAdmin() {
  const existing = await dynamoDb.send(new ScanCommand({
    TableName: "AthleteFuel",
    FilterExpression: "email = :email",
    ExpressionAttributeValues: { ":email": ADMIN_EMAIL }
  }));

  if (existing.Items && existing.Items.length > 0) {
    console.log("Admin user already exists:", ADMIN_EMAIL);
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await dynamoDb.send(new PutCommand({
    TableName: "AthleteFuel",
    Item: {
      id: "user_admin_" + Date.now().toString(),
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
      createdAt: new Date().toISOString()
    }
  }));

  console.log("Admin user created successfully!");
  console.log("  Email:   ", ADMIN_EMAIL);
  console.log("  Password:", ADMIN_PASSWORD);
}

createAdmin().catch(console.error);
