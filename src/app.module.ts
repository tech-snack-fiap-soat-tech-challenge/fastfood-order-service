import { ConfigurationModule } from '@app/configuration/configuration.module';
import { Module } from '@nestjs/common';
import { OrderModule } from '@order/order.module';
import { Logger } from '@common/application/logger';

@Module({
  imports: [ConfigurationModule, OrderModule],
  controllers: [],
  providers: [Logger],
})
export class AppModule {}
