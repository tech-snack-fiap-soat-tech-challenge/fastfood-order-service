// import { Status } from '@app/order/core/domain/enums/status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateOrderRequest {
  @ApiProperty({
    name: 'statusId',
    // enum: Status,
    // example: Status.Received,
    description: 'The order status',
    required: false,
  })
  @IsOptional()
  // @IsEnum(Status)
  statusId: number;

  @ApiProperty({
    name: 'observation',
    example: 'The order is ready',
    description: 'The order observation',
    required: false,
  })
  @IsOptional()
  observation: string;
}
