import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
  region: 'us-east-1',
  endpoint: 'http://localhost:8000',
});

async function ensureOrdersTable() {
  try {
    await client.send(new DescribeTableCommand({ TableName: 'Orders' }));
    console.log('Orders já existe – nada a fazer');
  } catch {
    await client.send(
      new CreateTableCommand({
        TableName: 'Orders',
        AttributeDefinitions: [
          { AttributeName: 'id', AttributeType: 'S' }, // PK
          { AttributeName: 'status', AttributeType: 'S' }, // GSI HASH
          { AttributeName: 'createdAt', AttributeType: 'S' }, // GSI RANGE
        ],
        KeySchema: [
          { AttributeName: 'id', KeyType: 'HASH' }, // Partition key
        ],
        BillingMode: 'PAY_PER_REQUEST',
        GlobalSecondaryIndexes: [
          {
            IndexName: 'GSI_Status',
            KeySchema: [
              { AttributeName: 'status', KeyType: 'HASH' }, // Partição por status
              { AttributeName: 'createdAt', KeyType: 'RANGE' }, // Ordena por data
            ],
            Projection: { ProjectionType: 'ALL' },
          },
        ],
      }),
    );
    console.log('Orders criada com sucesso');
  }
}

ensureOrdersTable().catch(console.error);
