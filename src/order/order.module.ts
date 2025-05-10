import { OrderEntity } from '@app/order/core/domain/entities/order.entity';
// import { OrdersRepository } from '@app/order/infrastructure/adapters/repositories/order.repository';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { OrderController } from '@order/api/controllers/order.controller';
import { GetAllOrdersQueryHandler } from './core/application/use-cases/get-all-orders/get-all-orders.handler';
import { IOrdersRepository } from './core/domain/interfaces/repositories/order.repository.interface';
import { GetOrdersByStatusHandler } from './core/application/use-cases/get-orders-by-status/get-orders-by-status.handler';
import { CreateOrderHandler } from './core/application/use-cases/create-order/create-order.handler';
import { UpdateOrderHandler } from './core/application/use-cases/update-order/update-order.handler';
import { DeleteOrderHandler } from './core/application/use-cases/delete-order/delete-order.handler';
import { PaymentEventHandler } from './core/application/listeners/payment/payment.handler';
import { OrdersRepository } from './infrastructure/adapters/repositories/order.repository';

const handlers = [
  GetAllOrdersQueryHandler,
  GetOrdersByStatusHandler,
  CreateOrderHandler,
  UpdateOrderHandler,
  DeleteOrderHandler,
  PaymentEventHandler,
];

const ordersRepository = {
  provide: IOrdersRepository,
  useClass: OrdersRepository,
};

@Module({
  imports: [CqrsModule],
  controllers: [OrderController],
  providers: [...handlers, ordersRepository],
})
export class OrderModule {}
