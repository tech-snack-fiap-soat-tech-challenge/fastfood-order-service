import { OrderEntity } from '@app/order/core/domain/entities/order.entity';
import { OrderOutput } from '../../dtos/order.output';
import { OrderMapper } from '../../mappers/order.mapper';

export class GetOrdersByStatusOutput {
  public static from(orders: OrderEntity[]): OrderOutput[] {
    return orders.map((order) => OrderMapper.toDto(order));
  }
}
