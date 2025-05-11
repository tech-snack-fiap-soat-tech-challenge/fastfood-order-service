import { ApiProperty } from '@nestjs/swagger';

export class OrderProductOutput {
  @ApiProperty({
    description: 'Unique identifier of the product',
    example: 2,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the product',
    example: 'Product Name',
  })
  name: string;

  @ApiProperty({
    description: 'Quantity of the product in the order',
    example: 1,
  })
  quantity: number;

  @ApiProperty({
    description: 'Price of the product',
    example: 100.0,
  })
  price: number;
}
