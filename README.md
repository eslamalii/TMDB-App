# TMDB Movie API

A RESTful movie database API built with NestJS, featuring user authentication, movie ratings, and watchlist management. Data is seeded from [The Movie Database (TMDB)](https://www.themoviedb.org/) API.

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Architecture & Design](#architecture--design-decisions)
- [Troubleshooting](#troubleshooting)

---

## Features

- Browse movies with pagination, search, and genre filtering
- JWT authentication (register/login)
- Rate movies (1-10 scale)
- Personal watchlist management
- Redis caching for optimized performance
- Interactive API documentation (Swagger)
- Fully containerized with Docker

---

## Prerequisites

- Docker & Docker Compose
- TMDB API Key ([Get one free here](https://www.themoviedb.org/settings/api))

---

## Quick Start

### 1. Clone and setup environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your TMDB_API_KEY
```

**Required `.env` variables:**

```env
PORT=3000
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=tmdb_app
DATABASE_HOST=db
DATABASE_PORT=5432
REDIS_HOST=cache
REDIS_PORT=6379
CACHE_TTL=300
TMDB_API_KEY=YOUR_TMDB_API_KEY_GOES_HERE
JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY
JWT_EXPIRES_IN=3600s
```

**Optional security/env settings:**

```env
# Swagger: enabled by default in non-production; set to true to force-enable in prod
ENABLE_SWAGGER=false

# CORS: comma-separated origins (leave empty to allow all in dev)
ALLOWED_ORIGINS=http://localhost:3000

# TypeORM: schema sync & SQL logging (disable in production)
DB_SYNC=true
DB_LOGGING=false

# Rate limiting: requests per TTL window
RATE_TTL_SECONDS=60
RATE_LIMIT=100
```

### 2. Start the application

```bash
# Build and start all services (API, PostgreSQL, Redis)
docker-compose up --build -d

# Check if containers are running
docker ps
```

### 3. Seed the database

```bash
# Run the seed script to populate movies and genres from TMDB
npm run seed

# Or through docker
docker-compose run --rm api npm run seed
```

### 4. Access the API

- **API Base URL:** **http://localhost:8080/api**

---

## API Documentation

Visit **http://localhost:8080/docs** for the full interactive API documentation.

### Key Endpoints

#### Public Endpoints

- `GET /api/movies` - List movies (with pagination, search, genre filter)
- `GET /api/movies/:id` - Get movie details
- `GET /api/genres` - List all genres

#### Protected Endpoints (require JWT)

- `POST /api/movies/:id/rate` - Rate a movie
- `GET /api/users/me/watchlist` - Get your watchlist
- `POST /api/users/me/watchlist` - Add movie to watchlist
- `DELETE /api/users/me/watchlist/:movieId` - Remove from watchlist

---

## Development

### Run locally (without Docker)

```bash
# Install dependencies
npm install

# Start PostgreSQL and Redis manually or via Docker
docker-compose up db cache -d

# Run in development mode
npm run start:dev
```

### Run tests

```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov
```

**Coverage Report:**

[![Test Coverage](https://i.ibb.co/BHKTLVrD/Screenshot-2025-11-18-at-4-06-58-AM.png)](https://ibb.co/p6r42vRD)

#### Understanding Test Coverage

**Why some lines remain uncovered:**

The uncovered lines (shown in the report above) are primarily:

- **Constructor decorators** (`@InjectRepository`, `@Inject`) - Framework boilerplate that can't be executed in unit tests

---

## Architecture & Design Decisions

### Database Schema

[![Database ERD](https://i.ibb.co/CpS4Sj8k/Untitled-diagram-2025-11-15-174457.png)](https://ibb.co/xKrwrnLp)

#### Entity Relationships

- **User** ↔ **Rating** (One-to-Many): Users can rate multiple movies
- **User** ↔ **Watchlist** (One-to-Many): Users can have multiple movies in their watchlist
- **Movie** ↔ **Rating** (One-to-Many): Movies can have multiple ratings from different users
- **Movie** ↔ **Watchlist** (One-to-Many): Movies can be in multiple users' watchlists
- **Movie** ↔ **Genre** (Many-to-Many): Movies can have multiple genres, genres can belong to multiple movies

#### Key Tables

- `user` - User accounts with authentication
- `movie` - Movie details from TMDB (with calculated avg_rating)
- `genre` - Movie genres
- `rating` - User ratings for movies (1-10 scale)
- `watchlist` - User's personal movie watchlist
- `movie_genre` - Join table for movie-genre relationship

### Tech Stack

- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL with TypeORM
- **Cache:** Redis (with custom cache key strategy for query params)
- **Authentication:** JWT with Passport strategies
- **Documentation:** Swagger/OpenAPI

### Key Design Choices

**1. Data Source**

- Movies are seeded from TMDB API into our database, not proxied live

**2. Caching Strategy**

- Custom `HttpCacheInterceptor` generates unique cache keys including query parameters
- TTL: 300 seconds (configurable via `CACHE_TTL`)

**3. Rating System**

- Recalculates movie's `avg_rating` on every new rating
- Uses database transactions for consistency
- Scores range from 1-10

**4. Security**

- Passwords hashed with bcrypt
- JWT tokens for stateless authentication
- Protected routes use `JwtAuthGuard`
- HTTP security headers via `helmet`
- Global rate limiting via `@nestjs/throttler` (configurable with `RATE_TTL_SECONDS`/`RATE_LIMIT`)

### Project Structure

```
src/
├── auth/            # Authentication & JWT strategies
├── cache/           # Redis cache configuration
├── common/          # Shared DTOs, guards, interceptors
├── database/        # TypeORM entities & config
├── genre/           # Genre endpoints
├── movie/           # Movie endpoints & business logic
├── rating/          # Rating system
├── seed/            # TMDB data seeding service
├── user/            # User management
└── watchlist/       # Watchlist feature
```

---

## License

This project is [MIT licensed](LICENSE).
