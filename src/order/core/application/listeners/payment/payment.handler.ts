import { CheckoutUpdatedEvent } from '@common/domain/events/checkoutUpdatedEvent';
import { IOrdersRepository } from '@app/order/core/domain/interfaces/repositories/order.repository.interface';
import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CheckoutStatusEnum } from '@app/common/enums/checkout-status.enum';
import { OrderStatusEnum } from '@app/order/core/domain/enums/order.status.enum';

@EventsHandler(CheckoutUpdatedEvent)
export class PaymentEventHandler
  implements IEventHandler<CheckoutUpdatedEvent>
{
  constructor(
    @Inject(IOrdersRepository)
    private readonly ordersRepository: IOrdersRepository,
  ) {}

  async handle(event: CheckoutUpdatedEvent) {
    const statusMapping = {
      [CheckoutStatusEnum.Paid]: OrderStatusEnum.Received,
      [CheckoutStatusEnum.Refused]: OrderStatusEnum.Cancelled,
    };
    const order = await this.ordersRepository.getById(event.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.status =
      statusMapping[event.checkoutStatus as keyof typeof statusMapping];

    await this.ordersRepository.update(event.orderId, order);
  }
}
