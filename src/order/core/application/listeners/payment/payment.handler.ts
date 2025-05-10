import { CheckoutUpdatedEvent } from '@common/domain/events/checkoutUpdatedEvent';
import { IOrdersRepository } from '@app/order/core/domain/interfaces/repositories/order.repository.interface';
import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

@EventsHandler(CheckoutUpdatedEvent)
export class PaymentEventHandler
  implements IEventHandler<CheckoutUpdatedEvent>
{
  constructor(
    @Inject(IOrdersRepository)
    private readonly ordersRepository: IOrdersRepository,
  ) {}

  async handle(event: CheckoutUpdatedEvent) {
    console.log('PaymentEventHandler', event);
    // const statusMapping = { paid: Status.Received, refused: Status.Cancelled };
    // const order = await this.ordersRepository.getOrderById(event.orderId);
    // if (!order) {
    //   throw new Error('Order not found');
    // }

    // order.statusId =
    //   statusMapping[event.checkoutStatus as keyof typeof statusMapping];
    await this.ordersRepository.getAll();
  }
}
