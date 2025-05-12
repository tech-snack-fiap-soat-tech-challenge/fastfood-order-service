import { CheckoutStatusEnum } from '@app/common/enums/checkout-status.enum';
import { IEvent } from '@nestjs/cqrs';

export class CheckoutUpdatedEvent implements IEvent {
  constructor(
    public readonly orderId: string,
    public readonly checkoutStatus: CheckoutStatusEnum,
  ) {}
}
