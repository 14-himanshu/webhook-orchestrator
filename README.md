# Webhook Orchestrator: Fault-Tolerant Distributed Delivery System

> A resilient, fault-tolerant distributed system engineered to handle asynchronous webhook ingestion and delivery. Instead of a standard CRUD app, this system is designed with enterprise-grade reliability in mind, utilizing background queues, exponential backoff retries, and a persistent Dead Letter Queue (DLQ) to ensure 100% observability and reliability.

## Architecture Overview

The system is separated into a four-tier architecture to decouple the ingestion of webhooks from their actual execution. This ensures our public-facing API remains highly available and responds instantly with a `202 Accepted` regardless of downstream performance.

```mermaid
flowchart LR
    Sender([Client / Sender]) --> |POST /api/webhook| Web[Next.js Ingestion API]
    Web --> |Push Job| Queue[(Redis Queue)]
    Queue --> |Pop Job| Worker[Node/BullMQ Worker]
    
    Worker --> |fetch()| TargetServer([Target Server])
    Worker -.-> |Exponential Backoff| TargetServer
    
    Worker --> |Log Success| DB[(PostgreSQL)]
    Worker --> |Log Permanent Failure| DLQ[(Dead Letter Queue)]
```

## Key Technical Decisions

- **Decoupled Architecture**: We strictly separated the Ingestion API from the Worker Process. In a typical serverless environment (like Vercel), long-running HTTP connections are killed if they exceed timeout limits. By dumping the payload directly into Redis, the Next.js API instantly returns a `202 Accepted` to the sender, ensuring we never drop an incoming webhook due to timeouts.
- **Exponential Backoff**: Downstream services can experience outages. The worker automatically retries failed deliveries up to 5 times, increasing the delay exponentially between each attempt.
- **Dead Letter Queue (DLQ)**: If a webhook exhausts all 5 of its retry attempts, it is caught and permanently logged into the PostgreSQL Dead Letter Queue. This prevents poison messages from blocking the queue indefinitely while ensuring zero data loss.
- **Docker Compose Orchestration**: The entire four-tier stack (PostgreSQL, Redis, Next.js Web App, and the Standalone Worker) is containerized and orchestrated via `docker-compose`, mirroring production execution exactly in the local environment.

## Local Development

The entire stack is containerized for zero-friction local development.

1. Ensure you have Docker and Docker Compose installed.
2. Run the following command to build and start the entire architecture:

```bash
docker compose up --build
```

This will automatically:
- Start the PostgreSQL database and initialize the Prisma schema.
- Start the Redis cache.
- Build and start the Next.js frontend and Ingestion API at `http://localhost:3000`.
- Boot up the standalone BullMQ worker to process the queue.

### Testing the System

Open a new terminal tab and fire a fake webhook to the system:

```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"targetUrl": "https://httpbin.org/post", "payload": {"message": "Hello from Docker!"}}'
```

Watch the Docker logs as the worker picks up the job, attempts delivery, and logs the outcome to the database! You can view the real-time status of your queue and DLQ directly on the Next.js dashboard at `http://localhost:3000`.
