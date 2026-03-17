# QR Code Generator API

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Bun-1-F9F1E1?style=flat-square&logo=bun&logoColor=black" alt="Bun" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://github.com/ErickJ10X/QRCodes/actions/workflows/ci.yml/badge.svg" alt="CI" />
</p>

<p align="center">
  REST API for generating, managing and analyzing QR codes — built with NestJS, PostgreSQL and Redis.
</p>

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
  - [Docker Compose](#docker-compose)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)

---

## Features

- **QR Code Generation** — PNG and SVG formats, configurable size (100–2000 px) and error correction levels (L/M/Q/H)
- **Authentication** — JWT access tokens (15 min) + refresh tokens (7 days) with revocation support
- **Role-Based Access Control** — `ADMIN` and `USER` roles with guard-level enforcement
- **Analytics** — Per-scan tracking with IP geolocation (MaxMind GeoLite2), device detection and daily aggregates
- **Redis Caching** — QR data cached with 7-day TTL; configurable per resource
- **Soft Delete** — Status-based lifecycle: `ACTIVE → ARCHIVED → DELETED`
- **Rate Limiting** — Global 100 req/min; 5 req/15 min on login and register
- **Health Checks** — Dedicated endpoints for database and Redis connectivity
- **Swagger UI** — Auto-generated OpenAPI docs at `/api/docs`
- **Structured Logging** — Pino with request correlation IDs
- **Security** — Helmet, CORS, bcrypt password hashing, input validation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 |
| Runtime | Bun 1 |
| Language | TypeScript 5 |
| Database | PostgreSQL 15 |
| ORM | Prisma 7 |
| Cache | Redis 7 + cache-manager |
| Auth | Passport.js + jose (JWT) |
| QR Generation | qrcode |
| Geolocation | MaxMind GeoLite2 + @maxmind/geoip2-node |
| Logging | nestjs-pino + pino-pretty (dev) |
| Validation | class-validator + class-transformer |
| Docs | @nestjs/swagger |
| Testing | Jest + ts-jest + Supertest + Faker |
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Hosting | Railway |

---

## Architecture

```
src/
├── core/                    # Cross-cutting services
│   ├── prisma.service.ts    # Database connection
│   ├── token.service.ts     # JWT generation & validation
│   └── password.service.ts  # Bcrypt hashing
├── common/                  # Shared utilities
│   ├── decorators/          # @Public, @CurrentUser, @Roles + custom validators
│   ├── guards/              # GlobalAuthGuard, JwtGuard, RolesGuard
│   ├── strategies/          # Passport JWT + refresh strategies
│   └── filters/             # HTTP exception filter
└── modules/
    ├── auth/                # Login, register, refresh, logout
    ├── users/               # User CRUD + role management
    ├── qr-codes/            # QR generation, download, archive
    ├── analytics/           # Scan recording, stats, dashboard
    ├── cache/               # Redis cache wrapper
    └── health/              # Health check endpoints
```

**Database schema — 6 models:** `User`, `RefreshToken`, `QrCode`, `QrMetadata`, `ScanLog`, `QrStatistic`

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) ≥ 1.0
- [Docker](https://www.docker.com) + Docker Compose
- PostgreSQL 15 (or use Docker)
- Redis 7 (or use Docker)

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/ErickJ10X/QRCodes.git
cd QRCodes

# 2. Install dependencies
bun install

# 3. Configure environment
cp .env.example .env
# Edit .env with your local values

# 4. Start infrastructure (Postgres + Redis only)
docker compose up postgres redis -d

# 5. Run migrations and generate Prisma client
bunx prisma migrate deploy
bunx prisma generate

# 6. Start in development mode (hot reload)
bun run start:dev
```

API available at `http://localhost:3000`
Swagger docs at `http://localhost:3000/api/docs`

### Docker Compose

Runs the full stack (app + postgres + redis + geoip updater):

```bash
# Build and start all services
docker compose up --build

# Stop
docker compose down

# Stop and remove volumes
docker compose down -v
```

> **GeoIP:** Set `MAXMIND_ACCOUNT_ID` and `MAXMIND_LICENSE_KEY` in your `.env` to enable geolocation on scan events. The app starts without them — scans will simply have `country: null`.

---

## Environment Variables

Copy `.env.example` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `REDIS_HOST` | Redis hostname | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password | — |
| `JWT_SECRET` | Secret for signing JWTs | — |
| `JWT_ACCESS_TOKEN_EXPIRES_IN` | Access token TTL | `15m` |
| `JWT_REFRESH_TOKEN_EXPIRES_IN` | Refresh token TTL | `7d` |
| `PORT` | Application port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `LOG_LEVEL` | Pino log level | `debug` |
| `MAXMIND_ACCOUNT_ID` | MaxMind account ID (GeoIP) | optional |
| `MAXMIND_LICENSE_KEY` | MaxMind license key (GeoIP) | optional |
| `GEOIP_DB_PATH` | Path to GeoLite2-City.mmdb | `/app/data/geoip/GeoLite2-City.mmdb` |

Generate a secure JWT secret:

```bash
openssl rand -hex 32
```

---

## API Reference

Full interactive docs available at `/api/docs` (Swagger UI).

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Create new account |
| `POST` | `/auth/login` | Public | Obtain access + refresh tokens |
| `POST` | `/auth/refresh` | Bearer | Rotate refresh token |
| `POST` | `/auth/logout` | Bearer | Revoke refresh token |

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/users` | ADMIN | List all users |
| `GET` | `/users/:id` | Bearer | Get user by ID |
| `PATCH` | `/users/:id` | Bearer | Update profile |
| `DELETE` | `/users/:id` | Bearer | Delete account |

### QR Codes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/qr-codes` | Bearer | Generate new QR code |
| `GET` | `/qr-codes` | Bearer | List QR codes (paginated) |
| `GET` | `/qr-codes/:id` | Bearer | Get QR code detail |
| `PUT` | `/qr-codes/:id` | Bearer | Update title / description / status |
| `DELETE` | `/qr-codes/:id` | Bearer | Soft delete |
| `POST` | `/qr-codes/:id/archive` | Bearer | Archive QR code |
| `GET` | `/qr-codes/:id/download` | Bearer | Download PNG or SVG file |
| `GET` | `/qr-codes/:id/stats` | Bearer | Per-QR scan statistics |

### Analytics

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/analytics/scan/:qrId` | Public | Record a scan event |
| `GET` | `/analytics/qr/:qrId` | Bearer | Statistics for a QR code |
| `GET` | `/analytics/dashboard` | Bearer | User dashboard summary |

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Full health status |
| `GET` | `/health/database` | Public | Database connectivity |
| `GET` | `/health/redis` | Public | Redis connectivity |

---

## Testing

```bash
# Unit tests
bun run test

# Unit tests with coverage report
bun run test:cov

# End-to-end tests (requires running Postgres + Redis)
bun run test:e2e
```

The test suite includes:

- **Unit tests** — services for auth, users, QR codes and analytics
- **E2E tests** — full HTTP lifecycle for all modules using Supertest
- **Factories** — Faker-based data factories for users, QR codes and scan logs

---

## Deployment

### Railway (Production)

The project is configured for one-click Railway deployment via `railway.toml`.

**Required services in your Railway project:**
- PostgreSQL plugin
- Redis plugin

**Required environment variables:**

```
DATABASE_URL     = ${{Postgres.DATABASE_URL}}
REDIS_HOST       = ${{Redis.REDISHOST}}
REDIS_PORT       = ${{Redis.REDISPORT}}
REDIS_PASSWORD   = ${{Redis.REDISPASSWORD}}
JWT_SECRET       = <openssl rand -hex 32>
NODE_ENV         = production
PORT             = 3000
```

The startup script (`scripts/start.sh`) automatically:
1. Downloads the GeoLite2-City database (if MaxMind credentials are set)
2. Runs `prisma migrate deploy`
3. Starts the application with `exec bun dist/main.js`

### Docker (Self-hosted)

The multi-stage Dockerfile produces a minimal production image running as a non-root user (`nestjs:1001`):

```bash
docker build -f docker/Dockerfile -t qrcodes-api .
docker run -p 3000:3000 --env-file .env qrcodes-api
```

---

## Project Structure

```
QRCodes/
├── .github/
│   └── workflows/
│       ├── ci.yml           # Lint, unit tests and e2e on every push/PR
│       └── deploy.yml       # Publish Docker image to GHCR on merge to main
├── docker/
│   └── Dockerfile           # Multi-stage build (deps → builder → runner)
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # SQL migration history
├── scripts/
│   └── start.sh             # Container startup: GeoIP download → migrate → run
├── src/
│   ├── core/                # Prisma, token and password services
│   ├── common/              # Guards, decorators, strategies, filters
│   ├── modules/             # auth · users · qr-codes · analytics · health
│   └── main.ts              # Bootstrap entry point
├── test/
│   ├── e2e/                 # End-to-end specs per module
│   ├── unit/                # Unit specs per service
│   ├── factories/           # Test data factories
│   └── mocks/               # ESM module mocks for Jest
├── .env.example             # Environment variable template
├── docker-compose.yml       # Full local stack
├── railway.toml             # Railway deployment config
└── prisma.config.ts         # Prisma datasource configuration
```

---

## License

MIT
