import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { IProduct } from '@app/common/interfaces/product';
import { IProductsService } from '@app/common/interfaces/products.service.interface';

@Injectable()
export class ProductsService implements IProductsService {
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('api.productsUrl');
  }

  async getProducts(): Promise<IProduct[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<IProduct[]>(`${this.apiUrl}/products`),
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products from API');
    }
  }

  async getProductById(id: string): Promise<IProduct | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<IProduct>(`${this.apiUrl}/products/${id}`),
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error(`Error fetching product ${id}:`, error);
      throw new Error(`Failed to fetch product ${id} from API`);
    }
  }
}
