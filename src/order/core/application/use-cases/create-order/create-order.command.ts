import { OrderProduct } from '@app/order/api/dtos/create.order.request';

export class CreateOrderCommand {
  public readonly customerId: number;
  public readonly products: OrderProduct[];
  public readonly observation: string;

  constructor(props: {
    customerId: number;
    products: OrderProduct[];
    observation: string;
  }) {
    this.customerId = props.customerId;
    this.products = props.products;
    this.observation = props.observation;
  }
}
