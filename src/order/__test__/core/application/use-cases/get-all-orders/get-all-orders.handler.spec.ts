import { GetAllOrdersOutput } from '@app/order/core/application/use-cases/get-all-orders/get-all-orders.output';
import { GetAllOrdersQueryHandler } from '../../../../../core/application/use-cases/get-all-orders/get-all-orders.handler';
import { GetAllOrdersQuery } from '../../../../../core/application/use-cases/get-all-orders/get-all-orders.query';
import { IOrdersRepository } from '@app/order/core/domain/interfaces/repositories/order.repository.interface';
import { OrderEntity } from '@app/order/core/domain/entities/order.entity';
import { OrderStatusEnum } from '@app/order/core/domain/enums/order.status.enum';

describe('GetAllOrdersQueryHandler', () => {
  let handler: GetAllOrdersQueryHandler;
  let ordersRepository: jest.Mocked<IOrdersRepository>;

  beforeEach(() => {
    ordersRepository = {
      getAll: jest.fn(),
    } as unknown as jest.Mocked<IOrdersRepository>;

    handler = new GetAllOrdersQueryHandler(ordersRepository);
  });

  describe('execute', () => {
    it('should return all orders when repository returns data', async () => {
      // Arrange
      const mockOrders: OrderEntity[] = [
        new OrderEntity({
          id: '1',
          customerId: 123,
          // status: OrderStatusEnum.Pending,
          products: [],
          // total: 100,
          observation: 'Test observation',
          createdAt: new Date().toISOString(),
        }),
        new OrderEntity({
          id: '2',
          customerId: 456,
          // status: OrderStatusEnum.Completed,
          products: [],
          // total: 200,
          observation: 'Another observation',
          createdAt: new Date().toISOString(),
        }),
      ];
      ordersRepository.getAll.mockResolvedValue(mockOrders);

      // Act
      const result = await handler.execute();

      // Assert
      expect(ordersRepository.getAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(GetAllOrdersOutput.from(mockOrders));
    });

    it('should return an empty array when repository returns no data', async () => {
      // Arrange
      ordersRepository.getAll.mockResolvedValue([]);

      // Act
      const result = await handler.execute();

      // Assert
      expect(ordersRepository.getAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(GetAllOrdersOutput.from([]));
    });
  });
});
