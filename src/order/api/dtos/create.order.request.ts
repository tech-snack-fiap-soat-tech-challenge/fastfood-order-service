import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  validate,
  ValidateNested,
} from 'class-validator';

export class OrderProduct {
  @ApiProperty({
    name: 'id',
    example: 1,
    description: 'The id of the product',
    required: false,
  })
  @IsNotEmpty({ message: 'The product id is required' })
  @IsNumber()
  id: number;

  @ApiProperty({
    name: 'quantity',
    example: 1,
    description: 'The quantity of the product',
    required: true,
  })
  @IsNotEmpty({ message: 'The product quantity is required' })
  @Min(1)
  quantity: number;
}

export class CreateOrderRequest {
  @ApiProperty({
    name: 'customerId',
    example: 1,
    description: 'The id of the customer',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  customerId: number;

  @ApiProperty({
    name: 'products',
    type: [OrderProduct],
    description: 'The list of products in the order',
    required: true,
  })
  @IsNotEmpty({ message: 'The products are required' })
  @IsArray()
  @ValidateNested({ each: true })
  products: OrderProduct[];

  @ApiProperty({
    name: 'observation',
    example: 'No onions',
    description: 'The order observation',
    required: false,
  })
  @IsOptional()
  @IsString()
  observation: string;
}
