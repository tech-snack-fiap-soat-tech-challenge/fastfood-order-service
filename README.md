# 🍔 FastFood - Order Service

Welcome to the **Order microservice** for the FastFood App!  
Built with **NestJS**, **TypeScript**, and **DynamoDB** — this service handles all order processing operations for our fast food ordering system.

**Sonar Analyses:**

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=tech-snack-fiap-soat-tech-challenge_fastfood-order-service&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=tech-snack-fiap-soat-tech-challenge_fastfood-order-service)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=tech-snack-fiap-soat-tech-challenge_fastfood-order-service&metric=coverage)](https://sonarcloud.io/summary/new_code?id=tech-snack-fiap-soat-tech-challenge_fastfood-order-service)

## 📋 Service Overview

The Order Service is responsible for:

- Managing customer orders from creation to completion
- Tracking order status throughout the fulfillment process
- Validating order items and quantities
- Calculating order totals and applying promotions
- Communicating order events to other microservices
- Providing a unified order management interface for the FastFood ecosystem

This microservice follows Clean Architecture principles, with clear separation between domain logic and infrastructure concerns, ensuring maintainable and testable code.

---

## 🚀 Getting Started with Local Development

### Prerequisites

Before you begin, make sure you have:

- [Node.js 20+](https://nodejs.org/pt/download)
- [DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) (or use it via Docker)
- [Docker](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/) (optional, but helpful!)

### Setup Environment Variables

Duplicate and rename the `.env.example` to `.env`. Then update it with your local configuration values.

### Install Dependencies

From the project root, run:

```bash
npm install
```

### Set Up DynamoDB Local

If you're running DynamoDB locally, make sure it's running on port 8000:

```bash
# Run this script to create the Orders table in DynamoDB Local
npm run dynamo:init
```

### Start the App in Dev Mode

```bash
npm run start:dev
```

---

## 🐳 Running with Docker

Prefer containers? Run the app using Docker:

```bash
docker compose up --build
```

> DynamoDB Local will be started automatically and the required tables will be created! 🙌

---

## 📚 API Docs with Swagger

API documentation is auto-generated using **Swagger** and available once the app is running.

👉 Visit: [http://localhost:3000/docs](http://localhost:3000/docs)

---

## 🧪 Running Tests

To run tests in watch mode during development:

```bash
npm run test:dev
```

---

## 📝 Notes

- DynamoDB tables are created using the setup script in `src/scripts/setup-dynamodb-local.ts`
- The app uses path aliases and a clean architecture
- The Orders table uses GSI_Status index to query orders by status and creation date
- Health check endpoints are included and integrated in Docker setup

---

Made with ❤️ by TechSnack — The FastFood App
