export class OrderProductEntity {
  constructor(
    readonly id: number,
    readonly name: string,
    readonly quantity: number,
    readonly price: number,
  ) {}
}
