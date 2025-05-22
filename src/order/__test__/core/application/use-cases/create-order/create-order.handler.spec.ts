import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrderHandler } from '../../../../../core/application/use-cases/create-order/create-order.handler';
import { CreateOrderCommand } from '../../../../../core/application/use-cases/create-order/create-order.command';
import { IOrdersRepository } from '@app/order/core/domain/interfaces/repositories/order.repository.interface';
import { SqsService } from '@app/common/application/sqs.service';
import { ConfigService } from '@nestjs/config';
import { OrderEntity } from '@app/order/core/domain/entities/order.entity';
import { OrderMapper } from '../../../../../core/application/mappers/order.mapper';
import { IProduct } from '@app/common/interfaces/product';
import { OrderStatusEnum } from '@app/order/core/domain/enums/order.status.enum';
import { CreateOrderOutput } from '@app/order/core/application/use-cases/create-order/create-order.output';
import { IProductsService } from '@app/common/interfaces/products.service.interface';
import { ICustomersService } from '@app/common/interfaces/customer.service.interface';

describe('CreateOrderHandler', () => {
  let handler: CreateOrderHandler;
  let ordersRepository: jest.Mocked<IOrdersRepository>;
  let sqsService: jest.Mocked<SqsService>;
  let configService: jest.Mocked<ConfigService>;
  let productsService: jest.Mocked<IProductsService>;
  let clientService: jest.Mocked<ICustomersService>;

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

    productsService = {
      getProducts: jest.fn(),
      getProductById: jest.fn(),
    } as unknown as jest.Mocked<IProductsService>;

    clientService = {
      getCustomerById: jest.fn(),
    } as unknown as jest.Mocked<ICustomersService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateOrderHandler,
        { provide: IOrdersRepository, useValue: ordersRepository },
        { provide: SqsService, useValue: sqsService },
        { provide: ConfigService, useValue: configService },
        { provide: IProductsService, useValue: productsService },
        { provide: ICustomersService, useValue: clientService },
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

      const mockProduct: IProduct = {
        id: 1,
        name: 'Product 1',
        price: 50,
        description: 'Description of Product 1',
        category_id: 10,
        stock_quantity: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockOrderEntity = new OrderEntity({
        id: '1',
        customerId: 123,
        customerName: 'John Doe',
        status: OrderStatusEnum.Pending,
        products: [{ id: 1, name: 'Product 1', quantity: 2, price: 50 }],
        total: 100,
        observation: 'Test observation',
        createdAt: new Date().toISOString(),
      });

      // Mock do serviço de produtos para retornar o produto solicitado
      productsService.getProductById.mockResolvedValue(mockProduct);

      jest.spyOn(OrderMapper, 'toEntity').mockReturnValue(mockOrderEntity);
      ordersRepository.create.mockResolvedValue(mockOrderEntity);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(productsService.getProductById).toHaveBeenCalledWith(1);
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

    it('should handle case when product is not found', async () => {
      // Arrange
      const command = new CreateOrderCommand({
        customerId: 123,
        observation: 'Test observation',
        products: [{ id: 999, quantity: 2 }], // ID inexistente
      });

      // Mock retornando null para um produto que não existe
      productsService.getProductById.mockResolvedValue(null);

      const mockOrderEntity = new OrderEntity({
        id: '1',
        customerId: 123,
        customerName: 'John Doe',
        status: OrderStatusEnum.Pending,
        products: [], // Sem produtos
        total: 0, // Total zero
        observation: 'Test observation',
        createdAt: new Date().toISOString(),
      });

      jest.spyOn(OrderMapper, 'toEntity').mockReturnValue(mockOrderEntity);
      ordersRepository.create.mockResolvedValue(mockOrderEntity);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(productsService.getProductById).toHaveBeenCalledWith(999);
      expect(ordersRepository.create).toHaveBeenCalledWith(mockOrderEntity);
      expect(result).toEqual(CreateOrderOutput.from(mockOrderEntity));
    });

    it('should throw an error if repository throws an exception', async () => {
      // Arrange
      const command = new CreateOrderCommand({
        customerId: 123,
        observation: 'Test observation',
        products: [{ id: 1, quantity: 2 }],
      });

      const mockProduct: IProduct = {
        id: 1,
        name: 'Product 1',
        price: 50,
        description: 'Description of Product 1',
        category_id: 10,
        stock_quantity: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      productsService.getProductById.mockResolvedValue(mockProduct);
      ordersRepository.create.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow('Database error');
    });

    it('should throw an error if products service throws an exception', async () => {
      // Arrange
      const command = new CreateOrderCommand({
        customerId: 123,
        observation: 'Test observation',
        products: [{ id: 1, quantity: 2 }],
      });

      productsService.getProductById.mockRejectedValue(new Error('API error'));

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow('API error');
    });
  });
});
