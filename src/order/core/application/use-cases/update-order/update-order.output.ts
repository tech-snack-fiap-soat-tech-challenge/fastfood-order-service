import { OrderEntity } from '@app/order/core/domain/entities/order.entity';
import { OrderOutput } from '../../dtos/order.output';
import { OrderMapper } from '../../mappers/order.mapper';

export class UpdateOrderOutput {
  order: OrderOutput;

  constructor(order: OrderOutput) {
    this.order = order;
  }

  public static from(order: OrderEntity): UpdateOrderOutput {
    return new UpdateOrderOutput(OrderMapper.toDto(order));
  }
}
