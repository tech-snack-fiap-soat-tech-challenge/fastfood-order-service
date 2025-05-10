import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrdersByStatusQuery } from './get-orders-by-status.query';
import { GetOrdersByStatusOutput } from './get-orders-by-status.output';
import { IOrdersRepository } from '@app/order/core/domain/interfaces/repositories/order.repository.interface';
import { Inject } from '@nestjs/common';

@QueryHandler(GetOrdersByStatusQuery)
export class GetOrdersByStatusHandler
  implements IQueryHandler<GetOrdersByStatusQuery, GetOrdersByStatusOutput>
{
  constructor(
    @Inject(IOrdersRepository)
    private readonly orderRepository: IOrdersRepository,
  ) {}

  async execute(
    query: GetOrdersByStatusQuery,
  ): Promise<GetOrdersByStatusOutput> {
    const { statusId } = query;
    const orders = await this.orderRepository.listByStatus(statusId);

    return GetOrdersByStatusOutput.from(orders);
  }
}
