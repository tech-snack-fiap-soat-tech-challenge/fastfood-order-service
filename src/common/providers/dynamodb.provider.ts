// src/common/providers/dynamodb.provider.ts
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Provider } from '@nestjs/common';

export const DYNAMO_CLIENT = 'DYNAMO_CLIENT';

export const DynamoProvider: Provider = {
  provide: DYNAMO_CLIENT,
  useFactory: () => {
    try {
      let config: DynamoDBClientConfig;

      // Adiciona o endpoint apenas se a variável estiver definida
      if (process.env.DYNAMO_ENDPOINT) {
        config = {
          endpoint: process.env.DYNAMO_ENDPOINT,
        };
      } else {
        config = {
          region: process.env.DYNAMODB_REGION ?? 'us-east-1',
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN,
          },
        };
      }

      const client = new DynamoDBClient(config);
      return DynamoDBDocumentClient.from(client, {
        marshallOptions: {
          removeUndefinedValues: true, // Remove valores undefined
          convertEmptyValues: true, // Converte strings vazias para null
          convertClassInstanceToMap: true,
        },
      });
    } catch (error) {
      console.error('Erro ao criar cliente DynamoDB:', error);
      throw error;
    }
  },
};
