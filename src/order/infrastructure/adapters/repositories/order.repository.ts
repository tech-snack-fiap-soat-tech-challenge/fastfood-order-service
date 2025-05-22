import { Inject, Injectable } from '@nestjs/common';
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
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
      const products = item.products.map(
        (p) => new OrderProductEntity(p.id, p.name, p.quantity, p.price),
      );

      const order = new OrderEntity({
        id: item.id,
        customerId: item.customerId,
        customerName: item.customerName,
        status: item.status,
        products,
        observation: item.observation,
        total: item.total,
        createdAt: item.createdAt,
      });

      return order;
    });
  }

  async getById(id: string): Promise<OrderEntity | null> {
    const { Items } = await this.db.send(
      new ScanCommand({
        TableName: this.table,
        // Filtra pelo ID do pedido
        ExpressionAttributeNames: {
          '#id': 'id',
        },
        FilterExpression: '#id = :id',
        ExpressionAttributeValues: {
          ':id': id,
        },
      }),
    );

    if (!Items || !Items.length) return null;

    const item = Items[0] as OrderEntity;
    const products = item.products.map(
      (p) => new OrderProductEntity(p.id, p.name, p.quantity, p.price),
    );

    const order = new OrderEntity({
      id: item.id,
      customerId: item.customerId,
      customerName: item.customerName,
      status: item.status,
      products,
      total: item.total,
      observation: item.observation,
      createdAt: item.createdAt,
    });

    order.status = item.status;
    order.total = item.total;

    return order;
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
      const products = item.products.map(
        (p) => new OrderProductEntity(p.id, p.name, p.quantity, p.price),
      );

      const order = new OrderEntity({
        id: item.id,
        customerId: item.customerId,
        customerName: item.customerName,
        products,
        observation: item.observation,
        total: item.total,
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

  async update(
    id: string,
    patch: Partial<Pick<OrderEntity, 'observation' | 'status'>>,
  ): Promise<OrderEntity> {
    // Inicializa arrays para construir a expressão dinamicamente
    const updateExpressions: string[] = [];
    const expressionAttributeValues: Record<string, string | number | boolean> =
      {};
    const expressionAttributeNames: Record<string, string> = {};

    // Adiciona campos dinamicamente à expressão
    if (patch.observation) {
      updateExpressions.push('#observation = :observation');
      expressionAttributeValues[':observation'] = patch.observation;
      expressionAttributeNames['#observation'] = 'observation';
    }

    if (patch.status) {
      updateExpressions.push('#status = :status');
      expressionAttributeValues[':status'] = patch.status;
      expressionAttributeNames['#status'] = 'status'; // Usa alias para evitar conflito
    }

    // Verifica se há algo para atualizar
    if (updateExpressions.length === 0) {
      throw new Error('No fields to update');
    }

    const { Attributes } = await this.db.send(
      new UpdateCommand({
        TableName: this.table,
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`, // Concatena os campos com vírgulas
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames, // Adiciona os aliases
        ReturnValues: 'ALL_NEW', // Retorna o item atualizado
      }),
    );

    if (!Attributes) {
      throw new Error(`Order with ID ${id} not found`);
    }

    const result = Attributes as OrderEntity;

    const products = (Attributes.products as OrderProductEntity[]).map(
      (p) => new OrderProductEntity(p.id, p.name, p.quantity, p.price),
    );

    const updatedOrder = new OrderEntity({
      id: result.id,
      customerId: result.customerId,
      customerName: result.customerName,
      products,
      observation: result.observation,
      total: result.total,
      createdAt: result.createdAt,
    });

    updatedOrder.status = result.status;
    updatedOrder.total = result.total;

    return updatedOrder;
  }

  async delete(orderId: string): Promise<void> {
    try {
      await this.db.send(
        new DeleteCommand({
          TableName: this.table,
          Key: { id: orderId }, // Chave primária para identificar o item
        }),
      );
    } catch (error) {
      console.error(`Failed to delete order with ID ${orderId}:`, error);
      throw new Error(`Could not delete order with ID ${orderId}`);
    }
  }
}

function debugMarshall(item: Record<string, unknown>) {
  for (const [key, val] of Object.entries(item)) {
    try {
      // Tenta converter só aquele par chave–valor
      marshall(
        { [key]: val },
        {
          removeUndefinedValues: true, // Remove valores undefined
          convertEmptyValues: true, // Converte strings vazias para null
          convertClassInstanceToMap: true,
        },
      );
    } catch (err) {
      console.error(`Atributo inválido: "${key}" →`, val, '\nErro:', err);
    }
  }
}
