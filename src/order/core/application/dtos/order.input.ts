import { OrderProductInput } from './order-products.input';

export interface OrderInput {
  customerId: number;
  customerName: string;
  observation?: string;
  products: OrderProductInput[];
  total: number;
}
