import { OrderOutput } from '@app/order/core/application/dtos/order.output';
import { OrderEntity } from '@app/order/core/domain/entities/order.entity';
import { OrderMapper } from '../../mappers/order.mapper';

export class GetAllOrdersOutput {
  public static from(orders: OrderEntity[]): OrderOutput[] {
    return orders.map((order) => OrderMapper.toDto(order));
  }
}
