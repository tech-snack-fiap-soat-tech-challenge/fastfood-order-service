import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrderCommand } from './create-order.command';
import { CreateOrderOutput } from './create-order.output';
import { IOrdersRepository } from '@app/order/core/domain/interfaces/repositories/order.repository.interface';
import { Inject } from '@nestjs/common';
import { OrderMapper } from '../../mappers/order.mapper';
import * as fs from 'fs';
import * as path from 'path';
import { OrderProductInput } from '../../dtos/order-products.input';
import { IProduct } from '@app/common/interfaces/product';
import { SqsService } from '@app/common/application/sqs.service';
import { ConfigService } from '@nestjs/config';
import { OrderProduct } from '@app/order/api/dtos/create.order.request';
import { OrderCreatedEvent } from '@app/common/domain/events/order-created.event';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler
  implements ICommandHandler<CreateOrderCommand, CreateOrderOutput>
{
  private readonly queueUrl: string;

  constructor(
    @Inject(IOrdersRepository)
    private readonly ordersRepository: IOrdersRepository,
    private readonly configService: ConfigService,
    private readonly sqsService: SqsService,
  ) {
    this.queueUrl = this.configService.get<string>('sqs.orderCreatedQueueUrl');
  }

  private async loadProducts(): Promise<IProduct[]> {
    const productsFilePath = path.resolve(
      __dirname,
      '../../../../../mocks/products.json',
    );
    const fileContent = await fs.promises.readFile(productsFilePath, 'utf-8');
    return JSON.parse(fileContent) as IProduct[];
  }

  private filterAndTransformProducts(
    products: OrderProduct[],
    productsData: IProduct[],
  ): OrderProductInput[] {
    const productIds = products.map((product) => product.id);

    const matchedProducts = productsData.filter((product: IProduct) =>
      productIds.includes(product.id),
    );

    return matchedProducts.map((product: IProduct) => ({
      id: product.id,
      name: product.name,
      quantity: products.find((p) => p.id === product.id)?.quantity || 0,
      price: product.unit_price,
    }));
  }

  private calculateTotal(products: OrderProductInput[]): number {
    return products.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0,
    );
  }

  async execute(command: CreateOrderCommand) {
    const { customerId, observation, products } = command;

    const productsData = await this.loadProducts();

    const transformedProducts = this.filterAndTransformProducts(
      products,
      productsData,
    );

    const total = this.calculateTotal(transformedProducts);

    const entity = OrderMapper.toEntity({
      customerId,
      observation,
      products: transformedProducts,
      total,
    });

    await this.ordersRepository.create(entity);

    const orderCreatedEvent = new OrderCreatedEvent(
      entity.id,
      customerId,
      total,
    );

    await this.sqsService.sendMessage(
      this.queueUrl,
      entity.id,
      JSON.stringify(orderCreatedEvent),
    );

    return CreateOrderOutput.from(entity);
  }
}
