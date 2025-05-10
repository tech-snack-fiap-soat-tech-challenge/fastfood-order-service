import { ApiProperty } from '@nestjs/swagger';

export class OrderProductOutput {
  @ApiProperty({
    description: 'Unique identifier of the product',
    example: 2,
  })
  id: number;

  @ApiProperty({
    description: 'Quantity of the product in the order',
    example: 1,
  })
  quantity: number;
}
