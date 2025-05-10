export class UpdateOrderCommand {
  public readonly observation: string;
  public readonly statusId: number;

  constructor(
    public readonly id: string,
    props: { observation: string; statusId: number },
  ) {
    this.observation = props.observation;
    this.statusId = props.statusId;
  }
}
