import { IProduct } from '@app/common/interfaces/product';

export const IProductsService = Symbol('IProductsService');

export interface IProductsService {
  getProducts(): Promise<IProduct[]>;
  getProductById(id: number): Promise<IProduct | null>;
}
