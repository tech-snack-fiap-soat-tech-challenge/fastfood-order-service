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

describe('CreateOrderHandler', () => {
  let handler: CreateOrderHandler;
  let ordersRepository: jest.Mocked<IOrdersRepository>;
  let sqsService: jest.Mocked<SqsService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    ordersRepository = {
      create: jest.fn(),
    } as unknown as jest.Mocked<IOrdersRepository>;

    sqsService = {
      sendMessage: jest.fn(),
    } as unknown as jest.Mocked<SqsService>;

    configService = {
      get: jest.fn().mockReturnValue('http://mock-queue-url'),
    } as unknown as jest.Mocked<ConfigService>;

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

  describe('execute', () => {
    it('should create an order and send a message to SQS', async () => {
      // Arrange
      const command = new CreateOrderCommand({
        customerId: 123,
        observation: 'Test observation',
        products: [{ id: 1, quantity: 2 }],
      });

      const mockProductsData: IProduct[] = [
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

      const mockOrderEntity = new OrderEntity({
        id: '1',
        customerId: 123,
        status: OrderStatusEnum.Pending,
        products: [{ id: 1, name: 'Product 1', quantity: 2, price: 50 }],
        total: 100,
        observation: 'Test observation',
        createdAt: new Date().toISOString(),
      });

      jest
        .spyOn(fs.promises, 'readFile')
        .mockResolvedValue(JSON.stringify(mockProductsData));
      jest.spyOn(OrderMapper, 'toEntity').mockReturnValue(mockOrderEntity);
      ordersRepository.create.mockResolvedValue(mockOrderEntity);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(fs.promises.readFile).toHaveBeenCalledWith(
        expect.stringContaining('products.json'),
        'utf-8',
      );
      expect(ordersRepository.create).toHaveBeenCalledWith(mockOrderEntity);
      expect(sqsService.sendMessage).toHaveBeenCalledWith(
        'http://mock-queue-url',
        mockOrderEntity.id,
        JSON.stringify({
          orderId: mockOrderEntity.id,
          customerId: 123,
          amount: 100,
        }),
      );
      expect(result).toEqual(CreateOrderOutput.from(mockOrderEntity));
    });

    it('should throw an error if products file is missing', async () => {
      // Arrange
      const command = new CreateOrderCommand({
        customerId: 123,
        observation: 'Test observation',
        products: [{ id: 1, quantity: 2 }],
      });

      jest
        .spyOn(fs.promises, 'readFile')
        .mockRejectedValue(new Error('File not found'));

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow('File not found');
    });

    it('should throw an error if repository throws an exception', async () => {
      // Arrange
      const command = new CreateOrderCommand({
        customerId: 123,
        observation: 'Test observation',
        products: [{ id: 1, quantity: 2 }],
      });

      jest
        .spyOn(fs.promises, 'readFile')
        .mockResolvedValue(
          JSON.stringify([{ id: 1, name: 'Product 1', unit_price: 50 }]),
        );
      ordersRepository.create.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow('Database error');
    });
  });
});
