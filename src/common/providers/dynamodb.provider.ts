// src/common/providers/dynamodb.provider.ts
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Provider } from '@nestjs/common';

export const DYNAMO_CLIENT = 'DYNAMO_CLIENT';

export const DynamoProvider: Provider = {
  provide: DYNAMO_CLIENT,
  useFactory: () => {
    // Habilitar logs verbosos do SDK AWS
    process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = '1';
    process.env.AWS_NODEJS_CONNECTION_REUSE_ENABLED = '1';

    // Log dos parâmetros de configuração
    console.log(
      `Configurando DynamoDB na região: ${process.env.DYNAMODB_REGION}`,
    );
    console.log(`Access Key ID disponível: ${!!process.env.AWS_ACCESS_KEY_ID}`);
    console.log(
      `Secret Access Key disponível: ${!!process.env.AWS_SECRET_ACCESS_KEY}`,
    );
    console.log(`Session Token disponível: ${!!process.env.AWS_SESSION_TOKEN}`);

    try {
      const config: DynamoDBClientConfig = {
        region: process.env.DYNAMODB_REGION ?? 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          sessionToken: process.env.AWS_SESSION_TOKEN,
        },
      };

      // Adiciona o endpoint apenas se a variável estiver definida
      if (process.env.DYNAMODB_ENDPOINT) {
        config.endpoint = process.env.DYNAMODB_ENDPOINT;
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
