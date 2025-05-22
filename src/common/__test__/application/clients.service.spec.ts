import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { CustomerService } from '../../infrastructure/services/clients.service';
import { ICustomer } from '@app/common/interfaces/customer';
import { Axios, AxiosResponse } from 'axios';

describe('CustomerService', () => {
  let service: CustomerService;
  let httpService: jest.Mocked<HttpService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    httpService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<HttpService>;

    configService = {
      get: jest.fn().mockReturnValue('http://api.example.com'),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        { provide: HttpService, useValue: httpService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
  });

  describe('getCustomerById', () => {
    it('should return customer data when the API call is successful', async () => {
      // Arrange
      const customerId = 123;
      const mockCustomer: ICustomer = {
        id: customerId,
        name: 'John Doe',
        email: 'john@example.com',
        document: '12345678900',
      };

      const mockResponse = {
        data: mockCustomer,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      httpService.get.mockReturnValue(
        of(mockResponse as AxiosResponse<ICustomer>),
      );

      // Act
      const result = await service.getCustomerById(customerId);

      // Assert
      expect(httpService.get).toHaveBeenCalledWith(
        `http://api.example.com/customer/${customerId}`,
      );
      expect(result).toEqual(mockCustomer);
    });

    it('should return null when the API returns a 404 status', async () => {
      // Arrange
      const customerId = 456;
      const error = {
        response: { status: 404 },
      };

      httpService.get.mockReturnValue(throwError(() => error));

      // Act
      const result = await service.getCustomerById(customerId);

      // Assert
      expect(httpService.get).toHaveBeenCalledWith(
        `http://api.example.com/customer/${customerId}`,
      );
      expect(result).toBeNull();
    });

    it('should throw an error when the API call fails with status other than 404', async () => {
      // Arrange
      const customerId = 789;
      const error = {
        response: { status: 500 },
      };

      httpService.get.mockReturnValue(throwError(() => error));

      // Act & Assert
      await expect(service.getCustomerById(customerId)).rejects.toThrow(
        `Failed to fetch customer ${customerId} from API`,
      );
      expect(httpService.get).toHaveBeenCalledWith(
        `http://api.example.com/customer/${customerId}`,
      );
    });

    it('should throw an error when the API call fails without response object', async () => {
      // Arrange
      const customerId = 101;
      const error = new Error('Network error');

      httpService.get.mockReturnValue(throwError(() => error));

      // Act & Assert
      await expect(service.getCustomerById(customerId)).rejects.toThrow(
        `Failed to fetch customer ${customerId} from API`,
      );
      expect(httpService.get).toHaveBeenCalledWith(
        `http://api.example.com/customer/${customerId}`,
      );
    });
  });
});
