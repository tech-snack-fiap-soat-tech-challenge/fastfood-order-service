export interface OrderInput {
  customerId: number;
  observation?: string;
  products?: {
    id: number;
    quantity: number;
  }[];
}
