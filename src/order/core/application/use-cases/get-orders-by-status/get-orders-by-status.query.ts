import { OrderStatusEnum } from '@app/order/core/domain/enums/order.status.enum';

export class GetOrdersByStatusQuery {
  constructor(public readonly status: OrderStatusEnum) {}
}
