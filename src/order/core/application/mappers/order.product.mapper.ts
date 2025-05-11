import { OrderProductEntity } from '@order/core/domain/entities/order.product.entity';
import { OrderProductOutput } from '../dtos/order-products.output';
import { OrderProductInput } from '../dtos/order-products.input';

export class OrderProductsMapper {
  /* domínio → DTO */
  static toDto(product: OrderProductEntity): OrderProductOutput {
    return {
      id: product.id,
      name: product.name,
      quantity: product.quantity,
      price: product.price,
    };
  }

  /* DTO (input) → domínio */
  static toEntity(dto: OrderProductInput): OrderProductEntity {
    return new OrderProductEntity(dto.id, dto.name, dto.quantity, dto.price);
  }
}
