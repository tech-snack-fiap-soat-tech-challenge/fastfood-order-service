import { OrderOutput } from '@app/order/core/application/dtos/order.output';
import { OrderEntity } from '@app/order/core/domain/entities/order.entity';
import { OrderMapper } from '../../mappers/order.mapper';

export class GetAllOrdersOutput {
  orders: OrderOutput[];

  constructor(orders: OrderEntity[]) {
    this.orders = orders.map((order) => OrderMapper.toDto(order));
  }

  public static from(orders: OrderEntity[]): GetAllOrdersOutput {
    return new GetAllOrdersOutput(orders);
  }
}
