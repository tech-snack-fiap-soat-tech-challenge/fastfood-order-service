import { OrderEntity } from '../../entities/order.entity';
import { OrderStatusEnum } from '../../enums/order.status.enum';

export interface IOrdersRepository {
  getAll(): Promise<OrderEntity[]>;
  listByCustomer(customerId: string): Promise<OrderEntity[]>;
  getById(id: string): Promise<OrderEntity | null>;
  getByStatus(status: OrderStatusEnum): Promise<OrderEntity[]>;
  create(order: OrderEntity): Promise<OrderEntity>;
  update(
    orderId: string,
    patch: Partial<Pick<OrderEntity, 'observation' | 'status'>>,
  ): Promise<OrderEntity>;
  delete(orderId: string): Promise<void>;
}

export const IOrdersRepository = Symbol('IOrdersRepository');
