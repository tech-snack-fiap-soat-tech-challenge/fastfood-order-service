import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';
import { OrderController } from '@order/api/controllers/order.controller';
import { IOrdersRepository } from './core/domain/interfaces/repositories/order.repository.interface';
import { GetOrdersByStatusHandler } from './core/application/use-cases/get-orders-by-status/get-orders-by-status.handler';
import { CreateOrderHandler } from './core/application/use-cases/create-order/create-order.handler';
import { UpdateOrderHandler } from './core/application/use-cases/update-order/update-order.handler';
import { DeleteOrderHandler } from './core/application/use-cases/delete-order/delete-order.handler';
import { PaymentEventHandler } from './core/application/listeners/payment/payment.handler';
import { OrdersRepository } from './infrastructure/adapters/repositories/order.repository';
import { CommonModule } from '@app/common/application/common.module';
import { PaymentListener } from './core/application/listeners/payment/payment.listener';
import { GetAllOrdersHandler } from './core/application/use-cases/get-all-orders/get-all-orders.handler';
import { IProductsService } from '@app/common/interfaces/products.service.interface';
import { ProductsService } from '@app/common/infrastructure/services/products.service';

const handlers = [
  GetAllOrdersHandler,
  GetOrdersByStatusHandler,
  CreateOrderHandler,
  UpdateOrderHandler,
  DeleteOrderHandler,
  PaymentEventHandler,
];

const listeners = [PaymentListener];

const OrdersRepositoryProvider = {
  provide: IOrdersRepository,
  useClass: OrdersRepository,
};

const ProductsServiceProvider = {
  provide: IProductsService,
  useClass: ProductsService,
};

@Module({
  imports: [
    CqrsModule,
    CommonModule,
    HttpModule, // Necessário para o ProductsService
  ],
  controllers: [OrderController],
  providers: [
    ...handlers,
    ...listeners,
    OrdersRepositoryProvider,
    ProductsServiceProvider, // Adicionando o provider diretamente
  ],
})
export class OrderModule {}
