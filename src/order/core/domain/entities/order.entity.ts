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
    status: OrderStatusEnum;
    products: OrderProductEntity[];
    observation: string;
    total: number;
    createdAt?: string;
  }) {
    this.id = init.id;
    this.customerId = init.customerId;
    this.status = init.status || OrderStatusEnum.Pending;
    this.products = init.products;
    this.total = init.total || 0;
    this.observation = init.observation;
    this.createdAt = init.createdAt || new Date().toISOString();
  }
}
