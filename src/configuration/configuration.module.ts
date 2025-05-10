import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration, pinoConfig } from './configuration';
import { LoggerModule } from 'nestjs-pino';
import { Logger } from '@common/application/logger';
import { DynamoProvider } from '@common/providers/dynamodb.provider';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    LoggerModule.forRoot({ pinoHttp: pinoConfig() }),
  ],
  providers: [Logger, DynamoProvider],
  exports: [Logger, DynamoProvider],
})
export class ConfigurationModule {}
