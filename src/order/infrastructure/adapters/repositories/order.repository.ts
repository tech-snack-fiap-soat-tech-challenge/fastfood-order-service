import { Inject, Injectable } from '@nestjs/common';
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { DYNAMO_CLIENT } from '@common/providers/dynamodb.provider';
import { marshall } from '@aws-sdk/util-dynamodb';

import { IOrdersRepository } from '@app/order/core/domain/interfaces/repositories/order.repository.interface';
import { OrderStatusEnum } from '@app/order/core/domain/enums/order.status.enum';
import { OrderEntity } from '@app/order/core/domain/entities/order.entity';
import { OrderProductEntity } from '@app/order/core/domain/entities/order.product.entity';

@Injectable()
export class OrdersRepository implements IOrdersRepository {
  private readonly table = 'Orders';

  constructor(
    @Inject(DYNAMO_CLIENT)
    private readonly db: DynamoDBDocumentClient,
  ) {}
  async getAll(): Promise<OrderEntity[]> {
    const allowedStatuses = [
      OrderStatusEnum.Pending,
      OrderStatusEnum.Completed,
      OrderStatusEnum.Cancelled,
    ];

    // Monta ExpressionAttributeValues e placeholders dinâmicos
    const ExpressionAttributeValues: Record<string, string | OrderStatusEnum> =
      {};
    const placeholders: string[] = [];
    allowedStatuses.forEach((st, idx) => {
      const key = `:s${idx}`;
      ExpressionAttributeValues[key] = st;
      placeholders.push(key);
    });

    const filterExpression = `#st IN (${placeholders.join(', ')})`;

    const { Items } = await this.db.send(
      new ScanCommand({
        TableName: this.table,
        // Apelida "status" como "#st"
        ExpressionAttributeNames: {
          '#st': 'status',
        },
        FilterExpression: filterExpression,
        ExpressionAttributeValues,
      }),
    );

    if (!Items || !Items.length) return [];

    return Items.map((item: OrderEntity) => {
      const products = (
        item.products as { id: number; quantity: number }[]
      ).map((p) => new OrderProductEntity(p.id, p.quantity));

      const order = new OrderEntity({
        id: item.id,
        customerId: item.customerId,
        products,
        observation: item.observation,
        createdAt: item.createdAt,
      });

      order.status = item.status;
      order.total = item.total;

      return order;
    });
  }

  listByCustomer(customerId: string): Promise<OrderEntity[]> {
    throw new Error('Method not implemented.');
  }

  findById(orderId: string): Promise<OrderEntity | null> {
    throw new Error('Method not implemented.');
  }

  async getByStatus(status: OrderStatusEnum): Promise<OrderEntity[]> {
    const { Items } = await this.db.send(
      new ScanCommand({
        TableName: this.table,
        // Apelida "status" como "#st"
        ExpressionAttributeNames: {
          '#st': 'status',
        },
        FilterExpression: '#st = :status',
        ExpressionAttributeValues: {
          ':status': status,
        },
      }),
    );

    if (!Items || !Items.length) return [];

    return Items.map((item: OrderEntity) => {
      const products = (
        item.products as { id: number; quantity: number }[]
      ).map((p) => new OrderProductEntity(p.id, p.quantity));

      const order = new OrderEntity({
        id: item.id,
        customerId: item.customerId,
        products,
        observation: item.observation,
        createdAt: item.createdAt,
      });

      order.status = item.status;
      order.total = item.total;

      return order;
    });
  }

  async create(order: OrderEntity): Promise<OrderEntity> {
    debugMarshall({ ...order });

    await this.db.send(
      new PutCommand({
        TableName: this.table,
        Item: order,
      }),
    );

    return order;
  }
  update(
    orderId: string,
    patch: Partial<Pick<OrderEntity, 'observation' | 'status'>>,
  ): Promise<OrderEntity> {
    throw new Error('Method not implemented.');
  }
  delete(orderId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

function debugMarshall(item: Record<string, unknown>) {
  for (const [key, val] of Object.entries(item)) {
    try {
      // Tenta converter só aquele par chave–valor
      marshall({ [key]: val }, { convertClassInstanceToMap: true });
    } catch (err) {
      console.error(`Atributo inválido: "${key}" →`, val, '\nErro:', err);
    }
  }
}
