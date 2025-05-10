import { CreateOrderRequest } from '@app/order/api/dtos/create.order.request';
import { CreateOrderCommand } from '@app/order/core/application/use-cases/create-order/create-order.command';
import { CreateOrderOutput } from '@app/order/core/application/use-cases/create-order/create-order.output';
import { GetAllOrdersOutput } from '@app/order/core/application/use-cases/get-all-orders/get-all-orders.output';
import { GetAllOrdersQuery } from '@app/order/core/application/use-cases/get-all-orders/get-all-orders.query';
import { GetOrdersByStatusOutput } from '@app/order/core/application/use-cases/get-orders-by-status/get-orders-by-status.output';
import { GetOrdersByStatusQuery } from '@app/order/core/application/use-cases/get-orders-by-status/get-orders-by-status.query';
import { UpdateOrderCommand } from '@app/order/core/application/use-cases/update-order/update-order.command';
import { UpdateOrderOutput } from '@app/order/core/application/use-cases/update-order/update-order.output';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateOrderRequest } from '../dtos/update.order.request';
import { DeleteOrderCommand } from '@app/order/core/application/use-cases/delete-order/delete-order.command';
import { OrderStatusEnum } from '@app/order/core/domain/enums/order.status.enum';
import { OrderOutput } from '@app/order/core/application/dtos/order.output';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all orders.',
    type: [OrderOutput],
  })
  @Get('/')
  getAllOrders() {
    return this.queryBus.execute<GetAllOrdersQuery, GetAllOrdersOutput>(
      new GetAllOrdersQuery(),
    );
  }

  @ApiOperation({ summary: 'Get order by status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the order.',
    type: [OrderOutput],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found.',
  })
  @ApiQuery({
    name: 'status',
    enum: OrderStatusEnum,
    required: true,
  })
  @Get('/by-status')
  async getOrderById(@Query('status') status: OrderStatusEnum) {
    return this.queryBus.execute<
      GetOrdersByStatusQuery,
      GetOrdersByStatusOutput
    >(new GetOrdersByStatusQuery(status));
  }

  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The order has been successfully created.',
    type: OrderOutput,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid order data.',
  })
  @Post('/')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createOrder(@Body() order: CreateOrderRequest) {
    const { customerId, observation, products } = order;
    return this.commandBus.execute<CreateOrderRequest, CreateOrderOutput>(
      new CreateOrderCommand({ customerId, observation, products }),
    );
  }

  @ApiOperation({ summary: 'Update an existing order' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The order has been successfully updated.',
    type: OrderOutput,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found.',
  })
  @Put(':orderId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateOrder(
    @Param('orderId') id: string,
    @Body() order: UpdateOrderRequest,
  ): Promise<UpdateOrderOutput> {
    return this.commandBus.execute<UpdateOrderCommand, UpdateOrderOutput>(
      new UpdateOrderCommand(id, order),
    );
  }

  // @ApiOperation({ summary: 'Delete an existing order' })
  // @ApiResponse({
  //   status: HttpStatus.NO_CONTENT,
  //   description: 'The order has been successfully deleted.',
  // })
  // @ApiResponse({
  //   status: HttpStatus.NOT_FOUND,
  //   description: 'Order not found.',
  // })
  // @Delete(':orderId')
  // async deleteOrder(@Param('orderId') id: number): Promise<void> {
  //   return this.commandBus.execute<DeleteOrderCommand, void>(
  //     new DeleteOrderCommand(id),
  //   );
  // }
}
