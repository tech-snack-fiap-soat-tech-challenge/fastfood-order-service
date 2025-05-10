import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { OrderProductInput } from '../../dtos/order-products.input';

export class CreateOrderCommand {
  public readonly customerId: number;
  public readonly products: OrderProductInput[];
  public readonly observation: string;

  constructor(props: {
    customerId: number;
    products: OrderProductInput[];
    observation: string;
  }) {
    this.customerId = props.customerId;
    this.products = props.products;
    this.observation = props.observation;
  }
}
