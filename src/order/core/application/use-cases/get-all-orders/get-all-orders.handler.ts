import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllOrdersQuery } from './get-all-orders.query';
import { IOrdersRepository } from '@app/order/core/domain/interfaces/repositories/order.repository.interface';
import { Inject } from '@nestjs/common';
import { GetAllOrdersOutput } from './get-all-orders.output';

@QueryHandler(GetAllOrdersQuery)
export class GetAllOrdersQueryHandler
  implements IQueryHandler<GetAllOrdersQuery, GetAllOrdersOutput>
{
  constructor(
    @Inject(IOrdersRepository)
    private readonly ordersRepository: IOrdersRepository,
  ) {}

  async execute(): Promise<GetAllOrdersOutput> {
    const orders = await this.ordersRepository.getAll();
    return GetAllOrdersOutput.from(orders);
  }
}
