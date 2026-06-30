<div align="center">
  <img src="./public/icon.svg" width="100" height="100" alt="Webhook Orchestrator Icon" />
  <h1>Webhook Orchestrator</h1>
  <p><strong>Fault-Tolerant Distributed Delivery System</strong></p>

  [![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat&logo=postgresql)](https://www.postgresql.org/)
  [![Redis](https://img.shields.io/badge/Redis-BullMQ-DC382D?style=flat&logo=redis)](https://redis.io/)
  [![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?style=flat)](https://clerk.dev/)
</div>

<br/>

> A resilient, fault-tolerant distributed system engineered to handle asynchronous webhook ingestion and delivery. Built for enterprise scale, this orchestrator features true **Multi-Tenancy**, background queues, exponential backoff retries, and a persistent Dead Letter Queue (DLQ) to ensure 100% observability and reliability.

## Architecture Overview

The system is separated into a four-tier architecture to decouple the ingestion of webhooks from their actual execution. This ensures our public-facing API remains highly available and responds instantly with a `202 Accepted` regardless of downstream performance.

```mermaid
flowchart LR
    Sender[Client / Sender] --> |POST /api/webhook| Web[Next.js Ingestion API]
    Web --> |Push Job| Queue[(Redis)]
    Queue --> |Pop Job| Worker[Node/BullMQ Worker]
    
    Worker --> |fetch| TargetServer[Target Server]
    Worker -.-> |Exponential Backoff| TargetServer
    
    Worker --> |Log Success| DB[(PostgreSQL)]
    Worker --> |Log Permanent Failure| DLQ[(Dead Letter Queue)]
```

## Key Technical Decisions

- **True Multi-Tenancy**: Built with enterprise architectures in mind. The entire system separates data by `tenantId` (resolving securely via Clerk Organizations or individual Users). Rate limits, webhook secrets, and history are strictly isolated per-tenant.
- **Decoupled Architecture**: We strictly separated the Ingestion API from the Worker Process. In a typical serverless environment (like Vercel), long-running HTTP connections are killed if they exceed timeout limits. By dumping the payload directly into Redis, the Next.js API instantly returns a `202 Accepted` to the sender, ensuring we never drop an incoming webhook due to timeouts.
- **Idempotent Processing**: Network glitches happen. If a client sends the exact same webhook twice, the Next.js API checks the `Idempotency-Key` header against Redis. Duplicate payloads are ignored and instantly return a `202 Accepted` without spawning redundant background jobs.
- **Token-Bucket Rate Limiting**: To protect the ingestion API from DDoS attacks or runaway client scripts, a Redis-backed rate limiter strictly limits clients to a maximum number of requests per minute, returning `HTTP 429 Too Many Requests` if exceeded.
- **Worker Rate Limiting**: To protect downstream APIs from DDoS attacks during massive traffic spikes, the BullMQ worker uses a token-bucket rate limiter to globally cap processing at 10 jobs per second, safely buffering the overflow in Redis.
- **Cryptographic Signatures (Security)**: The Ingestion API enforces zero-trust security. It requires an `x-signature` header on all incoming requests and verifies it against an HMAC SHA-256 hash using a secret key. Additionally, the worker attaches its own signature to outgoing requests so target servers can verify authenticity.
- **Exponential Backoff**: Downstream services can experience outages. The worker automatically retries failed deliveries up to your tenant's custom configuration (default 3-5 times), increasing the delay exponentially between each attempt.
- **Dead Letter Queue (DLQ)**: If a webhook exhausts all of its retry attempts, it is caught and permanently logged as a terminal `failed` event. You can easily inspect and replay DLQ events via the built-in Dashboard.
- **Docker Compose Orchestration**: The entire four-tier stack (PostgreSQL, Redis, Next.js Web App, and the Standalone Worker) is containerized and orchestrated via `docker-compose`, mirroring production execution exactly in the local environment.

## Deployment Architecture: The Vercel + Worker Split

Deploying this architecture requires understanding the difference between serverless functions and long-running processes.

- **The Frontend & Ingestion API (`/api/webhook`)**: Deploy this to a serverless platform like **Vercel** or **Netlify**. Because it instantly offloads jobs to Redis and returns a 202, it is perfectly suited for serverless execution.
- **The Worker (`src/worker.ts`)**: Serverless environments kill processes after a few seconds. Do **not** deploy the worker to Vercel. Instead, deploy the standalone worker script to a containerized hosting service that supports long-running background processes, like **Render**, **Railway**, or **Fly.io**.
- **The Databases**: You cannot use local Docker volumes in production. Provision a managed Redis instance (like **Upstash**) and a managed PostgreSQL database (like **Supabase** or **Neon**). Provide these connection URLs via environment variables to both Vercel and your Worker host.

## Local Development

The entire stack is containerized for zero-friction local development.

1. Ensure you have Docker and Docker Compose installed.
2. Ensure you have a `.env` file populated with your Clerk API Keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`).
3. Run the following command to build and start the entire architecture:

```bash
docker compose up --build
```

This will automatically:
- Start the PostgreSQL database and initialize the Prisma schema.
- Start the Redis cache.
- Build and start the Next.js frontend and Ingestion API at `http://localhost:3000`.
- Boot up the standalone BullMQ worker to process the queue.

### Testing the System

Because this system implements strict **Enterprise Security** (HMAC `x-signature` verification and `x-idempotency-key` enforcement), testing via manual `curl` commands is difficult. 

To provide a seamless developer experience, we built a **Developer Console / Webhook Simulator** directly into the Dashboard UI!

1. Open your browser to `http://localhost:3000`.
2. In the **Developer Console** on the left, enter a Target URL (e.g., `https://httpstat.us/500` to simulate a failure).
3. Enter a JSON payload.
4. Click **Fire Webhook**.

The Simulator automatically connects to a secure proxy route that generates the correct cryptographic signatures and idempotency keys, allowing you to instantly test the ingestion pipeline, worker delivery, and dead letter queueing without writing complex bash scripts!
