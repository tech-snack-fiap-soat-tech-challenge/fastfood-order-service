import { OrderProductEntity } from '@order/core/domain/entities/order.product.entity';
import { OrderProductOutput } from '../dtos/order-products.output';

export class OrderProductsMapper {
  /* domínio → DTO */
  static toDto(product: OrderProductEntity): OrderProductOutput {
    return {
      id: product.id,
      quantity: product.quantity,
    };
  }

  /* DTO (input) → domínio */
  static toEntity(dto: { id: number; quantity: number }): OrderProductEntity {
    return new OrderProductEntity(dto.id, dto.quantity);
  }
}
