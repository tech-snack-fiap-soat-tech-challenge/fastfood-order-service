// src/common/providers/dynamodb.provider.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Provider } from '@nestjs/common';

export const DYNAMO_CLIENT = 'DYNAMO_CLIENT';

export const DynamoProvider: Provider = {
  provide: DYNAMO_CLIENT,
  useFactory: () => {
    // Determina se deve usar DynamoDB local ou na AWS
    const isLocal = process.env.NODE_ENV !== 'production';

    // Opções de configuração para o cliente DynamoDB
    const clientOptions: any = {
      region: process.env.DYNAMODB_REGION ?? 'us-east-1',
    };

    // Configura endpoint apenas para ambiente local
    if (isLocal) {
      clientOptions.endpoint =
        process.env.DYNAMODB_ENDPOINT ?? 'http://localhost:8000';
      console.log(`Conectando ao DynamoDB local: ${clientOptions.endpoint}`);

      // Adiciona credenciais falsas se não houver credenciais AWS definidas
      // Isso é útil para DynamoDB local onde autenticação não é necessária
      if (!process.env.AWS_ACCESS_KEY_ID) {
        clientOptions.credentials = {
          accessKeyId: 'local',
          secretAccessKey: 'local',
        };
      }
    } else {
      console.log(
        `Conectando ao DynamoDB AWS na região: ${clientOptions.region}`,
      );
      // Em produção, as credenciais serão obtidas do ambiente (IAM role)
    }

    // Cria o cliente base
    const client = new DynamoDBClient(clientOptions);

    // Retorna o DocumentClient com opções aprimoradas de marshalling
    return DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true, // Remove valores undefined
        convertEmptyValues: true, // Converte strings vazias para null
        convertClassInstanceToMap: true, // Converte instâncias de classe em objetos simples
      },
      unmarshallOptions: {
        wrapNumbers: false, // Não envolve números grandes em objetos
      },
    });
  },
};
