import { OrderEntity } from '@app/order/core/domain/entities/order.entity';
import { OrderOutput } from '../../dtos/order.output';
import { OrderMapper } from '../../mappers/order.mapper';

export class CreateOrderOutput {
  order: OrderOutput;

  constructor(order: OrderOutput) {
    this.order = order;
  }

  public static from(order: OrderEntity): CreateOrderOutput {
    return new CreateOrderOutput(OrderMapper.toDto(order));
  }
}
