export class OrderProductEntity {
  constructor(
    readonly id: number,
    readonly quantity: number,
  ) {}

  /** Valor da linha = preço × qtde */
  // get total(): number {
  //   return this.productPrice * this.quantity;
  // }
}
