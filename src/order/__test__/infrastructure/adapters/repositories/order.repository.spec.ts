import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { OrdersRepository } from '@app/order/infrastructure/adapters/repositories/order.repository';
import { OrderStatusEnum } from '@app/order/core/domain/enums/order.status.enum';
import { OrderEntity } from '@app/order/core/domain/entities/order.entity';
import { OrderProductEntity } from '@app/order/core/domain/entities/order.product.entity';

describe('OrdersRepository', () => {
  let repository: OrdersRepository;
  let mockDb: jest.Mocked<DynamoDBDocumentClient>;

  beforeEach(() => {
    mockDb = {
      send: jest.fn(),
    } as unknown as jest.Mocked<DynamoDBDocumentClient>;
    repository = new OrdersRepository(mockDb);
  });

  describe('getAll', () => {
    it('should return a list of orders when Items are found', async () => {
      // Arrange
      const dynamoItems = [
        {
          id: '1',
          customerId: 123,
          status: OrderStatusEnum.Pending,
          products: [
            { id: 'p1', name: 'Burger', quantity: 2, price: 10 },
            { id: 'p2', name: 'Fries', quantity: 1, price: 5 },
          ],
          observation: 'No onions',
          total: 25,
          createdAt: new Date().toISOString(),
        },
      ];
      (mockDb.send as jest.Mock).mockResolvedValue({ Items: dynamoItems });

      // Act
      const orders = await repository.getAll();

      // Assert
      expect(mockDb.send).toHaveBeenCalledWith(expect.any(ScanCommand));
      expect(orders).toHaveLength(1);
      expect(orders[0]).toBeInstanceOf(OrderEntity);
      expect(orders[0].products).toHaveLength(2);
      expect(orders[0].status).toBe(OrderStatusEnum.Pending);
    });

    it('should return empty array when no Items found', async () => {
      // Arrange
      (mockDb.send as jest.Mock).mockResolvedValue({ Items: [] });

      // Act
      const orders = await repository.getAll();

      // Assert
      expect(orders).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should return an order when found', async () => {
      // Arrange
      const dynamoItem = {
        id: '1',
        customerId: 123,
        status: OrderStatusEnum.Completed,
        products: [{ id: 'p1', name: 'Pizza', quantity: 1, price: 20 }],
        observation: 'Extra cheese',
        total: 20,
        createdAt: new Date().toISOString(),
      };

      (mockDb.send as jest.Mock).mockResolvedValue({ Items: [dynamoItem] });

      // Act
      const order = await repository.getById('1');

      // Assert
      expect(mockDb.send).toHaveBeenCalledWith(expect.any(ScanCommand));
      expect(order).toBeInstanceOf(OrderEntity);
      expect(order?.id).toBe('1');
      expect(order?.products[0]).toBeInstanceOf(OrderProductEntity);
    });

    it('should return null if order is not found', async () => {
      // Arrange
      (mockDb.send as jest.Mock).mockResolvedValue({ Items: [] });

      // Act
      const order = await repository.getById('non-existing');

      // Assert
      expect(order).toBeNull();
    });
  });

  describe('getByStatus', () => {
    it('should return orders with the given status', async () => {
      // Arrange
      const dynamoItems = [
        {
          id: '1',
          customerId: 123,
          status: OrderStatusEnum.Completed,
          products: [{ id: 'p1', name: 'Pizza', quantity: 1, price: 20 }],
          observation: 'Extra cheese',
          total: 20,
          createdAt: new Date().toISOString(),
        },
      ];
      (mockDb.send as jest.Mock).mockResolvedValue({ Items: dynamoItems });

      // Act
      const orders = await repository.getByStatus(OrderStatusEnum.Completed);

      // Assert
      expect(mockDb.send).toHaveBeenCalledWith(expect.any(ScanCommand));
      expect(orders).toHaveLength(1);
      expect(orders[0].status).toBe(OrderStatusEnum.Completed);
    });
  });

  describe('create', () => {
    it('should call PutCommand and return the created order', async () => {
      // Arrange
      const order = new OrderEntity({
        id: '1',
        customerId: 123,
        status: OrderStatusEnum.Pending,
        products: [],
        observation: 'Test',
        total: 50,
        createdAt: new Date().toISOString(),
      });

      (mockDb.send as jest.Mock).mockResolvedValue({}); // Simulação de sucesso

      // Act
      const created = await repository.create(order);

      // Assert
      expect(mockDb.send).toHaveBeenCalledWith(expect.any(PutCommand));
      expect(created).toEqual(order);
    });
  });

  describe('update', () => {
    it('should update an order and return the updated order', async () => {
      // Arrange
      const originalItem = {
        id: '1',
        customerId: 123,
        status: OrderStatusEnum.Pending,
        products: [{ id: 'p1', name: 'Burger', quantity: 2, price: 10 }],
        observation: 'Old observation',
        total: 20,
        createdAt: new Date().toISOString(),
      };

      const updatedAttributes = {
        id: '1',
        customerId: 123,
        status: OrderStatusEnum.Completed,
        products: originalItem.products,
        observation: 'New observation',
        total: 20,
        createdAt: originalItem.createdAt,
      };

      (mockDb.send as jest.Mock).mockResolvedValue({
        Attributes: updatedAttributes,
      });

      // Act
      const updated = await repository.update('1', {
        observation: 'New observation',
        status: OrderStatusEnum.Completed,
      });

      // Assert
      expect(mockDb.send).toHaveBeenCalledWith(expect.any(UpdateCommand));
      expect(updated).toBeInstanceOf(OrderEntity);
      expect(updated.observation).toBe('New observation');
      expect(updated.status).toBe(OrderStatusEnum.Completed);
    });

    it('should throw an error if there are no fields to update', async () => {
      // Act & Assert
      await expect(repository.update('1', {})).rejects.toThrow(
        'No fields to update',
      );
    });

    it('should throw an error if Attributes is missing from update response', async () => {
      // Arrange
      (mockDb.send as jest.Mock).mockResolvedValue({ Attributes: undefined });
      // Act & Assert
      await expect(
        repository.update('1', { observation: 'Test' }),
      ).rejects.toThrow('Order with ID 1 not found');
    });
  });

  describe('delete', () => {
    it('should delete an order successfully', async () => {
      // Arrange
      (mockDb.send as jest.Mock).mockResolvedValue({});

      // Act
      await repository.delete('1');

      // Assert
      expect(mockDb.send).toHaveBeenCalledWith(expect.any(DeleteCommand));
    });

    it('should throw an error if deletion fails', async () => {
      // Arrange
      (mockDb.send as jest.Mock).mockRejectedValue(new Error('Deletion error'));

      // Act & Assert
      await expect(repository.delete('1')).rejects.toThrow(
        'Could not delete order with ID 1',
      );
    });
  });
});
