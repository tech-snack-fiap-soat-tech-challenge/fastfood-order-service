import { OrderStatusEnum } from '../enums/order.status.enum';
import { OrderProductEntity } from './order.product.entity';

export class OrderEntity {
  id: string;
  customerId: number;
  status: OrderStatusEnum;
  products: OrderProductEntity[];
  total: number;
  observation: string;
  createdAt: string;

  constructor(init: {
    id: string;
    customerId: number;
    products: OrderProductEntity[];
    observation: string;
    createdAt?: string;
  }) {
    this.id = init.id;
    this.customerId = init.customerId;
    this.status = OrderStatusEnum.Pending;
    this.products = init.products;
    this.total = 123;
    this.observation = init.observation;
    this.createdAt = init.createdAt || new Date().toISOString();
  }
}
