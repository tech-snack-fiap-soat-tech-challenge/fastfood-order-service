import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrderCommand } from './create-order.command';
import { CreateOrderOutput } from './create-order.output';
import { IOrdersRepository } from '@app/order/core/domain/interfaces/repositories/order.repository.interface';
import { Inject } from '@nestjs/common';
import { OrderMapper } from '../../mappers/order.mapper';
import { OrderProductInput } from '../../dtos/order-products.input';
import { IProduct } from '@app/common/interfaces/product';
import { SqsService } from '@app/common/application/sqs.service';
import { ConfigService } from '@nestjs/config';
import { OrderProduct } from '@app/order/api/dtos/create.order.request';
import { OrderCreatedEvent } from '@app/common/domain/events/order-created.event';
import { IProductsService } from '@app/common/interfaces/products.service.interface';

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
    @Inject(IProductsService)
    private readonly productsService: IProductsService,
  ) {
    this.queueUrl = this.configService.get<string>('sqs.orderCreatedQueueUrl');
  }

  private async loadProductsByIds(productIds: string[]): Promise<IProduct[]> {
    // Busca apenas os produtos específicos com base nos IDs solicitados
    const productPromises = productIds.map((id) =>
      this.productsService
        .getProductById(id)
        .then((product) => product || null),
    );

    const products = await Promise.all(productPromises);
    // Filtra produtos não encontrados (null)
    return products.filter((product) => product !== null);
  }

  private transformProducts(
    requestedProducts: OrderProduct[],
    loadedProducts: IProduct[],
  ): OrderProductInput[] {
    // Map para acessar quantidades rapidamente por ID
    const quantityMap = new Map(
      requestedProducts.map((product) => [product.id, product.quantity]),
    );

    return loadedProducts.map((product: IProduct) => ({
      id: product.id,
      name: product.name,
      quantity: quantityMap.get(product.id) || 0,
      price: product.price,
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

    // Extrai apenas os IDs dos produtos solicitados
    const productIds = products.map((product) => product.id);

    // Carrega apenas os produtos solicitados
    const loadedProducts = await this.loadProductsByIds(productIds);

    // Transforma os produtos carregados com as quantidades solicitadas
    const transformedProducts = this.transformProducts(
      products,
      loadedProducts,
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
