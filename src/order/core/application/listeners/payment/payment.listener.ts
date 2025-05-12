/* eslint-disable @typescript-eslint/no-misused-promises */
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentEventHandler } from './payment.handler';
import { SqsService } from '@app/common/application/sqs.service';
import { CheckoutUpdatedEvent } from '@app/common/domain/events/checkoutUpdatedEvent';

@Injectable()
export class PaymentListener implements OnModuleInit {
  private readonly queueUrl: string;
  private readonly logger = new Logger(PaymentListener.name);
  private readonly MESSAGE_RECEIVE_INTERVAL = 5000; // 5 seconds

  constructor(
    private readonly handler: PaymentEventHandler,
    private readonly sqsClient: SqsService,
    private readonly configService: ConfigService,
  ) {
    this.queueUrl = this.configService.get<string>(
      'sqs.paymentCompletedQueueUrl',
    );
  }

  onModuleInit() {
    void this.listenForMessages();
  }

  public listenForMessages() {
    setInterval(async () => {
      try {
        const response = await this.sqsClient.receiveMessages(this.queueUrl);

        if (response && response.length > 0) {
          for (const message of response) {
            this.logger.log(`Received message: ${message.Body}`);

            try {
              // Process the message
              await this.handler.handle(
                JSON.parse(message.Body) as CheckoutUpdatedEvent,
              );

              // Delete the message only if processing succeeds
              await this.sqsClient.deleteMessage(
                this.queueUrl,
                message.ReceiptHandle,
              );

              this.logger.log(`Deleted message with ID: ${message.MessageId}`);
            } catch (processingError) {
              this.logger.error(
                `Error processing message with ID: ${message.MessageId}`,
                processingError,
              );
              // Do not delete the message, so it can be retried
            }
          }
        }
      } catch (error) {
        this.logger.error('Error receiving messages from SQS:', error);
      }
    }, this.MESSAGE_RECEIVE_INTERVAL); // Poll every 5 seconds
  }
}
