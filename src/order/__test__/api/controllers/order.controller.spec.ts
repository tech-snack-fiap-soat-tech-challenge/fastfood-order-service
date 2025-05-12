import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { mock, MockProxy } from 'jest-mock-extended';
import { OrderController } from '@app/order/api/controllers/order.controller';
import { GetAllOrdersQuery } from '@app/order/core/application/use-cases/get-all-orders/get-all-orders.query';
import { GetOrdersByStatusQuery } from '@app/order/core/application/use-cases/get-orders-by-status/get-orders-by-status.query';
import { CreateOrderCommand } from '@app/order/core/application/use-cases/create-order/create-order.command';
import { UpdateOrderCommand } from '@app/order/core/application/use-cases/update-order/update-order.command';
import { DeleteOrderCommand } from '@app/order/core/application/use-cases/delete-order/delete-order.command';
import { OrderStatusEnum } from '@app/order/core/domain/enums/order.status.enum';

describe('OrderController', () => {
  let controller: OrderController;
  let commandBus: MockProxy<CommandBus>;
  let queryBus: MockProxy<QueryBus>;

  beforeEach(async () => {
    commandBus = mock<CommandBus>();
    queryBus = mock<QueryBus>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        { provide: CommandBus, useValue: commandBus },
        { provide: QueryBus, useValue: queryBus },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllOrders', () => {
    it('should call queryBus.execute with GetAllOrdersQuery', async () => {
      const mockResult = { orders: [] };
      queryBus.execute.mockResolvedValue(mockResult);

      const result = await controller.getAllOrders();

      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(GetAllOrdersQuery),
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getOrderById', () => {
    it('should call queryBus.execute with GetOrdersByStatusQuery', async () => {
      const mockResult = { orders: [] };
      queryBus.execute.mockResolvedValue(mockResult);

      const status = OrderStatusEnum.Pending;
      const result = await controller.getOrderById(status);

      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetOrdersByStatusQuery(status),
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('createOrder', () => {
    it('should call commandBus.execute with CreateOrderCommand', async () => {
      const mockResult = { id: '1', customerId: '123', total: 100 };
      commandBus.execute.mockResolvedValue(mockResult);

      const order = {
        customerId: 123,
        observation: 'Test observation',
        products: [{ id: 1, quantity: 2 }],
      };
      const result = await controller.createOrder(order);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new CreateOrderCommand(order),
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateOrder', () => {
    it('should call commandBus.execute with UpdateOrderCommand', async () => {
      const mockResult = { id: '1', status: OrderStatusEnum.Completed };
      commandBus.execute.mockResolvedValue(mockResult);

      const orderId = '1';
      const updateRequest = {
        observation: 'Updated observation',
        status: OrderStatusEnum.Pending,
      };
      const result = await controller.updateOrder(orderId, updateRequest);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new UpdateOrderCommand(orderId, updateRequest),
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('deleteOrder', () => {
    it('should call commandBus.execute with DeleteOrderCommand', async () => {
      commandBus.execute.mockResolvedValue(undefined);

      const orderId = '1';
      await controller.deleteOrder(orderId);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new DeleteOrderCommand(orderId),
      );
    });
  });
});
