export interface AppConfig {
  app: {
    env: string;
    port: number;
    logLevel: string;
  };
  sqs: {
    region: string;
    endpoint: string;
    orderCreatedQueueUrl: string;
    paymentCompletedQueueUrl: string;
  };
  api: {
    productsUrl: string;
  };
}

export const configuration = (): AppConfig => ({
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    logLevel: process.env.LOG_LEVEL || 'debug',
  },
  sqs: {
    region: process.env.AWS_REGION || 'us-east-1',
    endpoint:
      process.env.SQS_ENDPOINT ||
      (process.env.NODE_ENV === 'development'
        ? 'http://localhost:9324'
        : 'https://sqs.us-east-1.amazonaws.com'),
    orderCreatedQueueUrl:
      process.env.AWS_ORDER_CREATED_QUEUE_URL ||
      'http://localhost:9324/000000000000/order-created.fifo',
    paymentCompletedQueueUrl:
      process.env.AWS_PAYMENT_COMPLETED_QUEUE_URL ||
      'http://localhost:9324/000000000000/payment-completed.fifo',
  },
  api: {
    productsUrl: process.env.PRODUCTS_API_URL || 'http://localhost:3001',
  },
});

export const pinoConfig = () => {
  const config = configuration();
  const pinoOptions = {
    level: config.app.logLevel,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        singleLine: true,
        ignore: 'pid,hostname',
      },
    },
    singleLine: true,
    redact: ['req.headers.authorization'],
    formatters: {
      level: (label: string) => {
        return { level: label };
      },
    },
  };

  return pinoOptions;
};
