// src/common/providers/dynamodb.provider.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Provider } from '@nestjs/common';

export const DYNAMO_CLIENT = 'DYNAMO_CLIENT';

export const DynamoProvider: Provider = {
  provide: DYNAMO_CLIENT,
  useFactory: () => {
    const client = new DynamoDBClient({
      region: process.env.DYNAMODB_REGION ?? 'us-east-1',
      endpoint: process.env.DYNAMODB_ENDPOINT ?? 'http://localhost:8000',
    });
    return DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
      },
    });
  },
};
