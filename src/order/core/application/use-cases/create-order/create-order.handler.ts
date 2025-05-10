import {
  CommandHandler,
  EventBus,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { CreateOrderCommand } from './create-order.command';
import { CreateOrderOutput } from './create-order.output';
import { IOrdersRepository } from '@app/order/core/domain/interfaces/repositories/order.repository.interface';
import { Inject } from '@nestjs/common';
import { OrderMapper } from '../../mappers/order.mapper';
// import { GetProductByIdQuery } from '@app/product/core/application/use-cases/get-product-by-id/get-product-by-id.query';
// import { OrderProductsMapper } from '../../mappers/order.product.mapper';
// import { GetProductByIdOutput } from '@app/product/core/application/use-cases/get-product-by-id/get-product-by-id.output';
import { OrderCreatedEvent } from '@common/domain/events/order-created.event';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler
  implements ICommandHandler<CreateOrderCommand, CreateOrderOutput>
{
  constructor(
    @Inject(IOrdersRepository)
    private readonly ordersRepository: IOrdersRepository,
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateOrderCommand) {
    const { customerId, observation, products } = command;

    const entity = OrderMapper.toEntity({
      customerId,
      observation,
      products,
    });

    // const productIds = products.map((product) => product.productId);
    await this.ordersRepository.create(entity);

    // this.eventBus.publish(
    //   new OrderCreatedEvent(order.id, customerId, order.total),
    // );

    return CreateOrderOutput.from(entity);
  }
}
