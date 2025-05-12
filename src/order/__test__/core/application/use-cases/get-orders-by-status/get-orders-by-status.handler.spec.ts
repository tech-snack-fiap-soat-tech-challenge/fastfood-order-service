import { GetOrdersByStatusQuery } from '../../../../../core/application/use-cases/get-orders-by-status/get-orders-by-status.query';
import { IOrdersRepository } from '@app/order/core/domain/interfaces/repositories/order.repository.interface';
import { OrderEntity } from '@app/order/core/domain/entities/order.entity';
import { OrderStatusEnum } from '@app/order/core/domain/enums/order.status.enum';
import { GetOrdersByStatusHandler } from '@app/order/core/application/use-cases/get-orders-by-status/get-orders-by-status.handler';

describe('GetOrdersByStatusHandler', () => {
  let handler: GetOrdersByStatusHandler;
  let ordersRepository: jest.Mocked<IOrdersRepository>;

  beforeEach(() => {
    ordersRepository = {
      getByStatus: jest.fn(),
    } as unknown as jest.Mocked<IOrdersRepository>;

    handler = new GetOrdersByStatusHandler(ordersRepository);
  });

  describe('execute', () => {
    it('should return orders with the specified status', async () => {
      // Arrange
      const status = OrderStatusEnum.Pending;
      const mockOrders: OrderEntity[] = [
        new OrderEntity({
          id: '1',
          customerId: 123,
          status,
          products: [],
          total: 100,
          observation: 'Test observation',
          createdAt: new Date().toISOString(),
        }),
      ];
      ordersRepository.getByStatus.mockResolvedValue(mockOrders);

      // Act
      const result = await handler.execute(new GetOrdersByStatusQuery(status));

      // Assert
      expect(ordersRepository.getByStatus).toHaveBeenCalledWith(status);
      expect(result).toEqual(mockOrders);
    });

    it('should return an empty array when no orders match the status', async () => {
      // Arrange
      const status = OrderStatusEnum.Completed;
      ordersRepository.getByStatus.mockResolvedValue([]);

      // Act
      const result = await handler.execute(new GetOrdersByStatusQuery(status));

      // Assert
      expect(ordersRepository.getByStatus).toHaveBeenCalledWith(status);
      expect(result).toEqual([]);
    });

    it('should throw an error when repository throws an exception', async () => {
      // Arrange
      const status = OrderStatusEnum.Pending;
      const error = new Error('Database error');
      ordersRepository.getByStatus.mockRejectedValue(error);

      // Act & Assert
      await expect(
        handler.execute(new GetOrdersByStatusQuery(status)),
      ).rejects.toThrow('Database error');
    });
  });
});
