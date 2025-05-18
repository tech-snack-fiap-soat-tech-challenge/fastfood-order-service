import { Test, TestingModule } from '@nestjs/testing';
import { IOrdersRepository } from '@app/order/core/domain/interfaces/repositories/order.repository.interface';
import { CheckoutUpdatedEvent } from '@common/domain/events/checkoutUpdatedEvent';
import { CheckoutStatusEnum } from '@app/common/enums/checkout-status.enum';
import { OrderStatusEnum } from '@app/order/core/domain/enums/order.status.enum';
import { OrderEntity } from '@app/order/core/domain/entities/order.entity';
import { PaymentEventHandler } from '@app/order/core/application/listeners/payment/payment.handler';

describe('PaymentEventHandler', () => {
  let handler: PaymentEventHandler;
  let ordersRepository: jest.Mocked<IOrdersRepository>;

  beforeEach(async () => {
    ordersRepository = {
      getById: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<IOrdersRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentEventHandler,
        { provide: IOrdersRepository, useValue: ordersRepository },
      ],
    }).compile();

    handler = module.get<PaymentEventHandler>(PaymentEventHandler);
  });

  describe('handle', () => {
    it('should update the order status to Received when checkout status is Paid', async () => {
      // Arrange
      const event = new CheckoutUpdatedEvent('1', CheckoutStatusEnum.Paid);
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

      // Act
      await handler.handle(event);

      // Assert
      expect(ordersRepository.getById).toHaveBeenCalledWith('1');
      expect(ordersRepository.update).toHaveBeenCalledWith('1', {
        ...mockOrder,
        status: OrderStatusEnum.Received,
      });
    });

    it('should throw an error if the order is not found', async () => {
      // Arrange
      const event = new CheckoutUpdatedEvent('1', CheckoutStatusEnum.Paid);
      ordersRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.handle(event)).rejects.toThrow('Order not found');
      expect(ordersRepository.getById).toHaveBeenCalledWith('1');
      expect(ordersRepository.update).not.toHaveBeenCalled();
    });

    it('should update the order status to Cancelled when checkout status is Refused', async () => {
      // Arrange
      const event = new CheckoutUpdatedEvent('1', CheckoutStatusEnum.Refused);
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

      // Act
      await handler.handle(event);

      // Assert
      expect(ordersRepository.getById).toHaveBeenCalledWith('1');
      expect(ordersRepository.update).toHaveBeenCalledWith('1', {
        ...mockOrder,
        status: OrderStatusEnum.Cancelled,
      });
    });
  });
});
