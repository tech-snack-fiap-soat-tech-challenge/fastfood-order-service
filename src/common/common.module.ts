import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SqsService } from './application/sqs.service';
import { ProductsService } from './infrastructure/services/products.service';
import { IProductsService } from './interfaces/products.service.interface';
import { ICustomersService } from './interfaces/customer.service.interface';
import { CustomerService } from './infrastructure/services/clients.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [
    SqsService,
    {
      provide: IProductsService,
      useClass: ProductsService,
    },
    {
      provide: ICustomersService,
      useClass: CustomerService,
    },
  ],
  exports: [SqsService, IProductsService, ICustomersService],
})
export class CommonModule {}
