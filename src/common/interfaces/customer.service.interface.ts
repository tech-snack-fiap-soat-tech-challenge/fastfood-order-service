import { ICustomer } from './customer';

export const ICustomersService = Symbol('ICustomersService');

export interface ICustomersService {
  getCustomerById(id: number): Promise<ICustomer | null>;
}
