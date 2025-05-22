import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ICustomersService } from '@app/common/interfaces/customer.service.interface';
import { ICustomer } from '@app/common/interfaces/customer';

@Injectable()
export class CustomerService implements ICustomersService {
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('api.customersUrl');
  }

  async getCustomerById(id: number): Promise<ICustomer | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<ICustomer>(`${this.apiUrl}/customer/${id}`),
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error(`Error fetching customer ${id}:`, error);
      throw new Error(`Failed to fetch customer ${id} from API`);
    }
  }
}
