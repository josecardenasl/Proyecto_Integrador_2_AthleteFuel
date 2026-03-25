const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://localhost:8000",
  credentials: { accessKeyId: "local", secretAccessKey: "local" }
});

async function main() {
  // Check if table already exists
  const list = await client.send(new ListTablesCommand({}));
  if (list.TableNames.includes("AthleteFuel")) {
    console.log("Tabla AthleteFuel ya existe.");
    return;
  }

  await client.send(new CreateTableCommand({
    TableName: "AthleteFuel",
    BillingMode: "PAY_PER_REQUEST",
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }]
  }));

  console.log("Tabla AthleteFuel creada exitosamente.");
}

main().catch(console.error);
