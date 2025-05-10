import { mock, MockProxy } from 'jest-mock-extended';

import { IOrdersRepository } from '@app/order/core/domain/interfaces/repositories/order.repository.interface';
import { OrderSimpleEntity } from '@app/order/core/domain/entities/order.simple.entity';
import { GetAllOrdersQueryHandler } from './get-all-orders.handler';
import { GetAllOrdersQuery } from './get-all-orders.query';
import { GetAllOrdersOutput } from './get-all-orders.output';

describe('GetAllOrdersQueryHandler', () => {
  let repoMock: MockProxy<IOrdersRepository>;
  let handler: GetAllOrdersQueryHandler;

  beforeEach(() => {
    repoMock = mock<IOrdersRepository>();
    handler = new GetAllOrdersQueryHandler(repoMock);
  });

  /*--------------------------------------------------------------
   * 1. Já temos o teste "should be defined"
   *--------------------------------------------------------------*/
  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  /*--------------------------------------------------------------
   * 2. Caminho feliz – retorna todos os pedidos
   *--------------------------------------------------------------*/
  it('should return orders provided by the repository', async () => {
    // arrange
    const orderA = OrderSimpleEntity.createInstance({
      customerId: 1,
      products: [],
    });
    const orderB = OrderSimpleEntity.createInstance({
      customerId: 2,
      products: [],
    });
    repoMock.getOrders.mockResolvedValue([orderA, orderB]);

    // act
    const result = await handler.execute(new GetAllOrdersQuery());

    // assert
    expect(repoMock.getOrders).toHaveBeenCalledTimes(1);
    expect(result).toEqual(GetAllOrdersOutput.from([orderA, orderB]));
  });

  /*--------------------------------------------------------------
   * 3. Cenário vazio – repositório não tem pedidos
   *--------------------------------------------------------------*/
  it('should return an empty list when repository returns none', async () => {
    repoMock.getOrders.mockResolvedValue([]);

    const result = await handler.execute(new GetAllOrdersQuery());

    expect(result.orders).toHaveLength(0);
  });

  /*--------------------------------------------------------------
   * 4. Cenário de erro – repositório lança exceção
   *--------------------------------------------------------------*/
  it('should propagate errors from repository', async () => {
    repoMock.getOrders.mockRejectedValue(new Error('DB down'));

    await expect(handler.execute(new GetAllOrdersQuery())).rejects.toThrow(
      'DB down',
    );
  });
});
