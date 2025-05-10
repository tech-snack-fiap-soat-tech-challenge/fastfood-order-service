import { IOrdersRepository } from '@app/order/core/domain/interfaces/repositories/order.repository.interface';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateOrderOutput } from './update-order.output';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateOrderCommand } from './update-order.command';

@CommandHandler(UpdateOrderCommand)
export class UpdateOrderHandler
  implements ICommandHandler<UpdateOrderCommand, UpdateOrderOutput>
{
  constructor(
    @Inject(IOrdersRepository)
    private readonly ordersRepository: IOrdersRepository,
  ) {}
  async execute(command: UpdateOrderCommand) {
    const order = await this.ordersRepository.getById(command.id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.observation = command.observation ?? order.observation;
    order.status = command.status ?? order.status;

    const updated = await this.ordersRepository.update(command.id, order);
    return UpdateOrderOutput.from(updated);
  }
}
