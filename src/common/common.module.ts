import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SqsService } from './application/sqs.service';
import { ProductsService } from './infrastructure/services/products.service';
import { IProductsService } from './interfaces/products.service.interface';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [
    SqsService,
    {
      provide: IProductsService,
      useClass: ProductsService,
    },
  ],
  exports: [SqsService, IProductsService],
})
export class CommonModule {}
