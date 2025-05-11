import { OrderProductInput } from './order-products.input';

export interface OrderInput {
  customerId: number;
  observation?: string;
  products: OrderProductInput;
  total: number;
}
