import { Test, TestingModule } from '@nestjs/testing';
import { DeleteOrderHandler } from '../../../../../core/application/use-cases/delete-order/delete-order.handler';
import { DeleteOrderCommand } from '../../../../../core/application/use-cases/delete-order/delete-order.command';
import { IOrdersRepository } from '@app/order/core/domain/interfaces/repositories/order.repository.interface';
import { OrderEntity } from '@app/order/core/domain/entities/order.entity';
import { OrderStatusEnum } from '@app/order/core/domain/enums/order.status.enum';
import { NotFoundException } from '@nestjs/common';

describe('DeleteOrderHandler', () => {
  let handler: DeleteOrderHandler;
  let ordersRepository: jest.Mocked<IOrdersRepository>;

  beforeEach(async () => {
    ordersRepository = {
      getById: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<IOrdersRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteOrderHandler,
        { provide: IOrdersRepository, useValue: ordersRepository },
      ],
    }).compile();

    handler = module.get<DeleteOrderHandler>(DeleteOrderHandler);
  });

  describe('execute', () => {
    it('should cancel an existing order', async () => {
      // Arrange
      const command = new DeleteOrderCommand('1');
      const mockOrder = new OrderEntity({
        id: '1',
        customerId: 123,
        status: OrderStatusEnum.Pending,
        products: [],
        total: 100,
        observation: 'Test observation',
        createdAt: new Date().toISOString(),
      });

      ordersRepository.getById.mockResolvedValue(mockOrder);
      ordersRepository.update.mockResolvedValue(undefined);

      // Act
      await handler.execute(command);

      // Assert
      expect(ordersRepository.getById).toHaveBeenCalledWith('1');
      expect(ordersRepository.update).toHaveBeenCalledWith('1', {
        ...mockOrder,
        status: OrderStatusEnum.Cancelled,
      });
    });

    it('should throw NotFoundException if the order does not exist', async () => {
      // Arrange
      const command = new DeleteOrderCommand('1');
      ordersRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
      expect(ordersRepository.getById).toHaveBeenCalledWith('1');
      expect(ordersRepository.update).not.toHaveBeenCalled();
    });

    it('should propagate errors from the repository', async () => {
      // Arrange
      const command = new DeleteOrderCommand('1');
      ordersRepository.getById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow('Database error');
      expect(ordersRepository.getById).toHaveBeenCalledWith('1');
      expect(ordersRepository.update).not.toHaveBeenCalled();
    });
  });
});
