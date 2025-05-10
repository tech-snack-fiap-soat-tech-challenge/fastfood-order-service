import { OrderStatusEnum } from '@app/order/core/domain/enums/order.status.enum';

export class UpdateOrderCommand {
  public readonly observation: string;
  public readonly status: OrderStatusEnum;

  constructor(
    public readonly id: string,
    props: { observation: string; status: OrderStatusEnum },
  ) {
    this.observation = props.observation;
    this.status = props.status;
  }
}
