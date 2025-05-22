import { ApiProperty } from '@nestjs/swagger';
import { OrderStatusEnum } from '../../domain/enums/order.status.enum';
import { OrderProductOutput } from './order-products.output';

export class OrderOutput {
  @ApiProperty({
    description: 'Unique identifier of the order',
    example: 'c7973292-b33f-4f5c-9d31-47b747c4d2a7',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the customer who placed the order',
    example: 1,
  })
  customerId: number;

  @ApiProperty({
    description: 'Name of the customer who placed the order',
    example: 'John Doe',
  })
  customerName: string;

  @ApiProperty({
    description: 'Current status of the order',
    enum: OrderStatusEnum,
    example: OrderStatusEnum.Pending,
  })
  status: OrderStatusEnum;

  @ApiProperty({
    description: 'Additional observations for the order',
    example: 'Double onions',
    required: false,
  })
  observation?: string;

  @ApiProperty({
    description: 'Total price of the order',
    example: 123.45,
  })
  total: number; // decimal

  @ApiProperty({
    description: 'Date and time when the order was created',
    example: '2025-05-10T19:48:15.864Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'List of products in the order',
    type: [OrderProductOutput],
  })
  products: OrderProductOutput[];
}
