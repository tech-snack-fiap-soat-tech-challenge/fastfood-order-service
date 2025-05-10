import { OrderStatusEnum } from '../../domain/enums/order.status.enum';
import { OrderProductOutput } from './order-products.output';

export interface OrderOutput {
  id: string;
  customerId: number;
  status: OrderStatusEnum;
  observation?: string;
  total: number; // decimal
  createdAt: string;
  products: OrderProductOutput[];
}
