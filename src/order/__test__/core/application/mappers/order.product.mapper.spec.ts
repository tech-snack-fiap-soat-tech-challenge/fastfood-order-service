import { OrderProductInput } from '@app/order/core/application/dtos/order-products.input';
import { OrderProductsMapper } from '@order/core/application/mappers/order.product.mapper';
import { OrderProductEntity } from '@order/core/domain/entities/order.product.entity';

describe('OrderProductsMapper', () => {
  describe('toDto', () => {
    it('should map OrderProductEntity to plain object correctly', () => {
      const productEntity = new OrderProductEntity(1, 'Burger', 2, 50);
      const dto = OrderProductsMapper.toDto(productEntity);
      expect(dto).toEqual({
        id: 1,
        name: 'Burger',
        quantity: 2,
        price: 50,
      });
    });
  });

  describe('toEntity', () => {
    it('should map OrderProductInput to OrderProductEntity correctly', () => {
      const productInput: OrderProductInput = {
        id: 2,
        name: 'Fries',
        quantity: 1,
        price: 30,
      };
      const entity = OrderProductsMapper.toEntity(productInput);
      expect(entity).toBeInstanceOf(OrderProductEntity);
      expect(entity.id).toBe(productInput.id);
      expect(entity.name).toBe(productInput.name);
      expect(entity.quantity).toBe(productInput.quantity);
      expect(entity.price).toBe(productInput.price);
    });
  });
});
