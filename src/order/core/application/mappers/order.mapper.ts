import { OrderEntity } from '@order/core/domain/entities/order.entity';
import { OrderProductsMapper } from './order.product.mapper';
import { OrderOutput } from '../dtos/order.output';
import { randomUUID } from 'crypto';
import { OrderInput } from '../dtos/order.input';

export class OrderMapper {
  static toDto(order: OrderEntity): OrderOutput {
    return {
      id: order.id,
      customerId: order.customerId,
      customerName: order.customerName,
      status: order.status,
      observation: order.observation,
      total: order.total,
      createdAt: order.createdAt,
      products: order.products.map(OrderProductsMapper.toDto),
    };
  }

  static toEntity(dto: OrderInput): OrderEntity {
    const products = Array.isArray(dto.products)
      ? dto.products.map(OrderProductsMapper.toEntity)
      : [];
    return new OrderEntity({
      id: randomUUID(),
      customerName: dto.customerName,
      customerId: dto.customerId,
      products: products,
      total: dto.total,
      observation: dto.observation,
      createdAt: new Date().toISOString(),
    });
  }
}
