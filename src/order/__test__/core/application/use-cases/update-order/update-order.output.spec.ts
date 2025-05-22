import { Test, TestingModule } from '@nestjs/testing';
import { UpdateOrderHandler } from '../../../../../core/application/use-cases/update-order/update-order.handler';
import { UpdateOrderCommand } from '../../../../../core/application/use-cases/update-order/update-order.command';
import { IOrdersRepository } from '@app/order/core/domain/interfaces/repositories/order.repository.interface';
import { OrderEntity } from '@app/order/core/domain/entities/order.entity';
import { OrderStatusEnum } from '@app/order/core/domain/enums/order.status.enum';
import { NotFoundException } from '@nestjs/common';
import { UpdateOrderOutput } from '../../../../../core/application/use-cases/update-order/update-order.output';

describe('UpdateOrderHandler', () => {
  let handler: UpdateOrderHandler;
  let ordersRepository: jest.Mocked<IOrdersRepository>;

  beforeEach(async () => {
    ordersRepository = {
      getById: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<IOrdersRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateOrderHandler,
        { provide: IOrdersRepository, useValue: ordersRepository },
      ],
    }).compile();

    handler = module.get<UpdateOrderHandler>(UpdateOrderHandler);
  });

  describe('execute', () => {
    it('should update an existing order', async () => {
      // Arrange
      const command = new UpdateOrderCommand('1', {
        observation: 'Updated observation',
        status: OrderStatusEnum.Completed,
      });

      const mockOrder = new OrderEntity({
        id: '1',
        customerId: 123,
        customerName: 'John Doe',
        status: OrderStatusEnum.Pending,
        products: [],
        total: 100,
        observation: 'Original observation',
        createdAt: new Date().toISOString(),
      });

      const updatedOrder = {
        ...mockOrder,
        observation: 'Updated observation',
        status: OrderStatusEnum.Completed,
      };

      ordersRepository.getById.mockResolvedValue(mockOrder);
      ordersRepository.update.mockResolvedValue(updatedOrder);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(ordersRepository.getById).toHaveBeenCalledWith('1');
      expect(ordersRepository.update).toHaveBeenCalledWith('1', updatedOrder);
      expect(result).toEqual(UpdateOrderOutput.from(updatedOrder));
    });

    it('should throw NotFoundException if the order does not exist', async () => {
      // Arrange
      const command = new UpdateOrderCommand('1', {
        observation: 'Updated observation',
        status: OrderStatusEnum.Completed,
      });

      ordersRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
      expect(ordersRepository.getById).toHaveBeenCalledWith('1');
      expect(ordersRepository.update).not.toHaveBeenCalled();
    });

    it('should propagate errors from the repository', async () => {
      // Arrange
      const command = new UpdateOrderCommand('1', {
        observation: 'Updated observation',
        status: OrderStatusEnum.Completed,
      });

      ordersRepository.getById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow('Database error');
      expect(ordersRepository.getById).toHaveBeenCalledWith('1');
      expect(ordersRepository.update).not.toHaveBeenCalled();
    });
  });
});
