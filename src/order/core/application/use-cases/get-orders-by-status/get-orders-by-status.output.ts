import { OrderEntity } from '@app/order/core/domain/entities/order.entity';
import { OrderOutput } from '../../dtos/order.output';
import { OrderMapper } from '../../mappers/order.mapper';

export class GetOrdersByStatusOutput {
  orders: OrderOutput[];

  constructor(orders: OrderOutput[]) {
    this.orders = orders;
  }

  public static from(orders: OrderEntity[]): GetOrdersByStatusOutput {
    return new GetOrdersByStatusOutput(
      orders.map((order) => OrderMapper.toDto(order)),
    );
  }
}
