import { OrderInput } from '@app/order/core/application/dtos/order.input';
import { OrderMapper } from '@order/core/application/mappers/order.mapper';
import { OrderEntity } from '@order/core/domain/entities/order.entity';
import { OrderStatusEnum } from '@order/core/domain/enums/order.status.enum';

describe('OrderMapper', () => {
  describe('toDto', () => {
    it('should map OrderEntity to OrderOutput correctly', () => {
      const orderEntity = new OrderEntity({
        id: 'order-1',
        customerId: 100,
        customerName: 'John Doe',
        status: OrderStatusEnum.Pending,
        observation: 'Test order',
        total: 150,
        createdAt: '2025-05-14T00:00:00.000Z',
        products: [
          {
            id: 1,
            name: 'Burger',
            quantity: 2,
            price: 50,
          },
        ],
      });

      const dto = OrderMapper.toDto(orderEntity);

      expect(dto.id).toBe(orderEntity.id);
      expect(dto.customerId).toBe(orderEntity.customerId);
      expect(dto.status).toBe(orderEntity.status);
      expect(dto.observation).toBe(orderEntity.observation);
      expect(dto.total).toBe(orderEntity.total);
      expect(dto.createdAt).toBe(orderEntity.createdAt);
      expect(dto.products).toHaveLength(1);
      expect(dto.products[0]).toEqual({
        id: 1,
        name: 'Burger',
        quantity: 2,
        price: 50,
      });
    });
  });

  describe('toEntity', () => {
    it('should map OrderInput to OrderEntity and generate id and createdAt', () => {
      const orderInput: OrderInput = {
        customerId: 200,
        customerName: 'Jane Doe',
        observation: 'New Order',
        total: 300,
        products: [
          {
            id: 2,
            name: 'Pizza',
            quantity: 1,
            price: 300,
          },
        ],
      };

      const entity = OrderMapper.toEntity(orderInput);

      expect(entity).toBeInstanceOf(OrderEntity);
      expect(entity.customerId).toBe(orderInput.customerId);
      expect(entity.observation).toBe(orderInput.observation);
      expect(entity.total).toBe(orderInput.total);
      expect(entity.products).toHaveLength(1);
      expect(entity.products[0]).toEqual({
        id: 2,
        name: 'Pizza',
        quantity: 1,
        price: 300,
      });
      expect(entity.id).toBeDefined();
      expect(typeof entity.id).toBe('string');
      expect(entity.createdAt).toBeDefined();
      expect(new Date(entity.createdAt).toString()).not.toBe('Invalid Date');
    });
  });
});
