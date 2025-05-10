import { ICommandHandler, EventPublisher, CommandHandler } from '@nestjs/cqrs';
import { DeleteOrderCommand } from './delete-order.command';
import { Inject, NotFoundException } from '@nestjs/common';
import { IOrdersRepository } from '@app/order/core/domain/interfaces/repositories/order.repository.interface';
import { OrderStatusEnum } from '@app/order/core/domain/enums/order.status.enum';

@CommandHandler(DeleteOrderCommand)
export class DeleteOrderHandler implements ICommandHandler<DeleteOrderCommand> {
  constructor(
    @Inject(IOrdersRepository)
    private readonly ordersRepository: IOrdersRepository,
  ) {}

  async execute(command: DeleteOrderCommand): Promise<void> {
    const { id } = command;
    const order = await this.ordersRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // order.status = OrderStatusEnum.Cancelled;
    await this.ordersRepository.update(id, order);
  }
}
