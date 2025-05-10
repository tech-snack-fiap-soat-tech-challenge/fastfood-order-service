import { Status } from '@app/common/enuns/status.enum';
import { IEvent } from '@nestjs/cqrs';

export class CheckoutUpdatedEvent implements IEvent {
  constructor(
    public readonly orderId: number,
    public readonly checkoutStatus: Status,
  ) {}
}
