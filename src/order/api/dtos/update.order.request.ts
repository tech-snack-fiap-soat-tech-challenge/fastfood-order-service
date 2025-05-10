import { OrderStatusEnum } from '@app/order/core/domain/enums/order.status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateOrderRequest {
  @ApiProperty({
    name: 'status',
    enum: OrderStatusEnum,
    example: OrderStatusEnum.Received,
    description: 'The order status',
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderStatusEnum)
  status: OrderStatusEnum;

  @ApiProperty({
    name: 'observation',
    example: 'The order is ready',
    description: 'The order observation',
    required: false,
  })
  @IsOptional()
  observation: string;
}
