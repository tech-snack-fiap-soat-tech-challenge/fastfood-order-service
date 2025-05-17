import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrderHandler } from '../../../../../core/application/use-cases/create-order/create-order.handler';
import { CreateOrderCommand } from '../../../../../core/application/use-cases/create-order/create-order.command';
import { IOrdersRepository } from '@app/order/core/domain/interfaces/repositories/order.repository.interface';
import { SqsService } from '@app/common/application/sqs.service';
import { ConfigService } from '@nestjs/config';
import { OrderEntity } from '@app/order/core/domain/entities/order.entity';
import { OrderMapper } from '../../../../../core/application/mappers/order.mapper';
import { IProduct } from '@app/common/interfaces/product';
import * as fs from 'fs';
import { OrderStatusEnum } from '@app/order/core/domain/enums/order.status.enum';
import { CreateOrderOutput } from '@app/order/core/application/use-cases/create-order/create-order.output';

jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');
  return {
    ...actualFs,
    promises: {
      readFile: jest.fn(),
    },
  };
});

describe('Feature: Create Food Order', () => {
  let handler: CreateOrderHandler;
  let ordersRepository: jest.Mocked<IOrdersRepository>;
  let sqsService: jest.Mocked<SqsService>;
  let configService: jest.Mocked<ConfigService>;

  // Common test setup
  beforeEach(async () => {
    // Setup dependencies
    ordersRepository = {
      create: jest.fn(),
    } as unknown as jest.Mocked<IOrdersRepository>;
    sqsService = {
      sendMessage: jest.fn(),
    } as unknown as jest.Mocked<SqsService>;
    configService = {
      get: jest.fn().mockReturnValue('http://mock-queue-url'),
    } as unknown as jest.Mocked<ConfigService>;

    // Create handler with dependencies
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateOrderHandler,
        { provide: IOrdersRepository, useValue: ordersRepository },
        { provide: SqsService, useValue: sqsService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    handler = module.get<CreateOrderHandler>(CreateOrderHandler);
  });

  describe('Scenario: Customer submits a valid order', () => {
    it('should create the order and notify the kitchen', async () => {
      // Given a customer with ID 123
      const customerId = 123;

      // And the customer wants to order 2 units of Product 1
      const orderCommand = new CreateOrderCommand({
        customerId,
        observation: 'No onions please',
        products: [{ id: 1, quantity: 2 }],
      });

      // And Product 1 exists in the catalog priced at $50
      const availableProducts: IProduct[] = [
        {
          id: 1,
          name: 'Product 1',
          unit_price: 50,
          description: 'Description of Product 1',
          category_id: 10,
          stock_quantity: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      jest
        .spyOn(fs.promises, 'readFile')
        .mockResolvedValue(JSON.stringify(availableProducts));

      // And the system can create orders
      const expectedOrder = new OrderEntity({
        id: 'order-123',
        customerId,
        status: OrderStatusEnum.Pending,
        products: [{ id: 1, name: 'Product 1', quantity: 2, price: 50 }],
        total: 100,
        observation: 'No onions please',
        createdAt: new Date().toISOString(),
      });
      jest.spyOn(OrderMapper, 'toEntity').mockReturnValue(expectedOrder);
      ordersRepository.create.mockResolvedValue(expectedOrder);

      // When the customer submits the order
      const result = await handler.execute(orderCommand);

      // Then the order should be saved to the database
      expect(ordersRepository.create).toHaveBeenCalledWith(expectedOrder);

      // And the kitchen should be notified about the new order
      expect(sqsService.sendMessage).toHaveBeenCalledWith(
        'http://mock-queue-url',
        expectedOrder.id,
        JSON.stringify({
          orderId: expectedOrder.id,
          customerId,
          amount: 100,
        }),
      );

      // And the customer should receive confirmation with order details
      expect(result).toEqual(CreateOrderOutput.from(expectedOrder));
    });
  });

  describe('Scenario: Product catalog is unavailable', () => {
    it('should inform the customer that the order cannot be processed', async () => {
      // Given the product catalog is unavailable
      jest
        .spyOn(fs.promises, 'readFile')
        .mockRejectedValue(new Error('File not found'));

      // And a customer attempts to place an order
      const orderCommand = new CreateOrderCommand({
        customerId: 123,
        observation: 'Test observation',
        products: [{ id: 1, quantity: 2 }],
      });

      // When the customer submits the order
      const orderPromise = handler.execute(orderCommand);

      // Then the system should inform that the order cannot be processed
      await expect(orderPromise).rejects.toThrow('File not found');

      // And no order should be created
      expect(ordersRepository.create).not.toHaveBeenCalled();

      // And no kitchen notification should be sent
      expect(sqsService.sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('Scenario: Order system experiences a database failure', () => {
    it('should inform the customer that the order failed', async () => {
      // Given the product catalog is available
      jest
        .spyOn(fs.promises, 'readFile')
        .mockResolvedValue(
          JSON.stringify([{ id: 1, name: 'Product 1', unit_price: 50 }]),
        );

      // And a customer attempts to place an order
      const orderCommand = new CreateOrderCommand({
        customerId: 123,
        observation: 'Test observation',
        products: [{ id: 1, quantity: 2 }],
      });

      // But the database is experiencing issues
      ordersRepository.create.mockRejectedValue(new Error('Database error'));

      // When the customer submits the order
      const orderPromise = handler.execute(orderCommand);

      // Then the system should inform that the order failed
      await expect(orderPromise).rejects.toThrow('Database error');

      // And no kitchen notification should be sent
      expect(sqsService.sendMessage).not.toHaveBeenCalled();
    });
  });
});
