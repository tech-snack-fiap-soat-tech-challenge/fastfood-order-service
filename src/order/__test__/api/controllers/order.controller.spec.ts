import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { mock } from 'jest-mock-extended';
import { OrderController } from '@app/order/api/controllers/order.controller';

describe('OrderController (init only)', () => {
  let controller: OrderController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        { provide: CommandBus, useValue: mock<CommandBus>() },
        { provide: QueryBus, useValue: mock<QueryBus>() },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
