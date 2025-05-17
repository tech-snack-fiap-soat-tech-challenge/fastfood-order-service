import { Test, TestingModule } from '@nestjs/testing';
import { SqsService } from '@app/common/application/sqs.service';
import { ConfigService } from '@nestjs/config';
import { PaymentListener } from '@app/order/core/application/listeners/payment/payment.listener';
import { PaymentEventHandler } from '@app/order/core/application/listeners/payment/payment.handler';

describe('PaymentListener', () => {
  let listener: PaymentListener;
  let handler: jest.Mocked<PaymentEventHandler>;
  let sqsService: jest.Mocked<SqsService>;
  let configService: jest.Mocked<ConfigService>;
  let loggerSpy;
  let setIntervalSpy: jest.Mock;
  let intervalCallback: () => any;
  const originalSetInterval = global.setInterval;

  beforeEach(async () => {
    // Mock do setInterval para capturar o callback sem usar temporizadores reais
    setIntervalSpy = jest.fn((callback: any) => {
      intervalCallback = callback;
      return 123; // fake timer id
    });
    global.setInterval = setIntervalSpy as any;

    handler = {
      handle: jest.fn(),
    } as unknown as jest.Mocked<PaymentEventHandler>;

    sqsService = {
      receiveMessages: jest.fn(),
      deleteMessage: jest.fn(),
    } as unknown as jest.Mocked<SqsService>;

    configService = {
      get: jest
        .fn()
        .mockReturnValue('http://localhost:9324/queue/payment-completed.fifo'),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentListener,
        { provide: PaymentEventHandler, useValue: handler },
        { provide: SqsService, useValue: sqsService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    listener = module.get<PaymentListener>(PaymentListener);
    loggerSpy = jest.spyOn(listener['logger'], 'log').mockImplementation();
    jest.spyOn(listener['logger'], 'error').mockImplementation();
  });

  // Restaurar o setInterval original após todos os testes
  afterAll(() => {
    global.setInterval = originalSetInterval;
  });

  describe('listenForMessages', () => {
    it('should set up an interval to poll for messages', () => {
      // Act
      listener.listenForMessages();

      // Assert
      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        listener['MESSAGE_RECEIVE_INTERVAL'],
      );
    });

    it('should process and delete messages successfully', async () => {
      // Arrange
      const mockMessage = {
        MessageId: '1',
        Body: JSON.stringify({ orderId: '1', checkoutStatus: 'paid' }),
        ReceiptHandle: 'receipt-handle-1',
      };

      sqsService.receiveMessages.mockResolvedValue([mockMessage]);
      handler.handle.mockResolvedValue(undefined);
      sqsService.deleteMessage.mockResolvedValue(undefined);

      // Act
      listener.listenForMessages();
      // Executa o callback direto para simular o setInterval
      await intervalCallback();

      // Assert
      expect(sqsService.receiveMessages).toHaveBeenCalledWith(
        'http://localhost:9324/queue/payment-completed.fifo',
      );
      expect(handler.handle).toHaveBeenCalledWith({
        orderId: '1',
        checkoutStatus: 'paid',
      });
      expect(sqsService.deleteMessage).toHaveBeenCalledWith(
        'http://localhost:9324/queue/payment-completed.fifo',
        'receipt-handle-1',
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        `Deleted message with ID: ${mockMessage.MessageId}`,
      );
    });

    it('should not delete the message if processing fails', async () => {
      // Arrange
      const mockMessage = {
        MessageId: '1',
        Body: JSON.stringify({ orderId: '1', checkoutStatus: 'paid' }),
        ReceiptHandle: 'receipt-handle-1',
      };

      sqsService.receiveMessages.mockResolvedValue([mockMessage]);
      handler.handle.mockRejectedValue(new Error('Processing error'));

      // Act
      listener.listenForMessages();
      await intervalCallback();

      // Assert
      expect(sqsService.receiveMessages).toHaveBeenCalledWith(
        'http://localhost:9324/queue/payment-completed.fifo',
      );
      expect(handler.handle).toHaveBeenCalledWith({
        orderId: '1',
        checkoutStatus: 'paid',
      });
      expect(sqsService.deleteMessage).not.toHaveBeenCalled();
    });

    it('should log an error if receiving messages fails', async () => {
      // Arrange
      const error = new Error('SQS error');
      sqsService.receiveMessages.mockRejectedValue(error);
      const errorSpy = jest.spyOn(listener['logger'], 'error');

      // Act
      listener.listenForMessages();
      await intervalCallback();

      // Assert
      expect(sqsService.receiveMessages).toHaveBeenCalledWith(
        'http://localhost:9324/queue/payment-completed.fifo',
      );
      expect(handler.handle).not.toHaveBeenCalled();
      expect(sqsService.deleteMessage).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
