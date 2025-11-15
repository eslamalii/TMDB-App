TMDB App: Development Roadmap

This document is the master plan for building the End-to-End RESTful App. We will follow this plan step-by-step, using a TDD (Test-Driven Development) methodology.

1. "Definition of Done" (Final Requirements)

This is our master checklist. The project is "done" when all of these are checked:

[ ] Framework: Built with NestJS.

[ ] Data: Database is populated from the TMDB API.

[ ] Endpoints (Read): Implement listing, searching, pagination, and filtering.

[ ] Endpoints (Feature): Implement "rate a movie" (and update avg score).

[ ] Endpoints (Feature): Implement "add to watchlist."

[ ] Endpoints (Filter): Implement filtering by movie genre.

[ ] Performance: Caching is implemented to reduce DB calls.

[ ] Deployment: Runs in a Docker container via docker-compose up.

[ ] Testing: > 85% unit test coverage (achieved via TDD).

[ ] Documentation: API documentation is provided (via Swagger).

[ ] Security: User-specific APIs are secured (via JWT).

[ ] Best Practices: Code follows SOLID, KISS, YAGNI, and DRY principles.

[ ] README: A high-quality README.md explains setup, design choices, and API location.

2. Task 1: Project Setup & Dockerization

These are the initial "get started" commands.

Initialize NestJS Project:

# This creates the project in a new 'tmdb-app' folder

nest new tmdb-app

# Move into your new project directory

cd tmdb-app

Create Project Files:
Create the following files in your tmdb-app root directory:

Dockerfile

docker-compose.yml

.env.example
(You can copy these from our previous chat.)

Create Local .env File:
Copy the example file. This file is ignored by Git and holds your secrets.

cp .env.example .env

Action: Open .env and add your real TMDB_API_KEY and a random JWT_SECRET.

Update src/main.ts:
Modify src/main.ts to use the PORT from your .env file and to add a global /api prefix to all routes.

// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
const app = await NestFactory.create(AppModule);

// Add a global prefix, so all routes are /api/...
app.setGlobalPrefix('api');

// Get port from environment variables
const port = process.env.PORT || 3000;

await app.listen(port);
console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

Build and Run!
This one command builds your NestJS image and starts the api, db, and cache containers.

# The '-d' flag runs them in detached (background) mode

docker-compose up --build -d

Verify:

Open your browser to http://localhost:8080/api. You should see the NestJS "Hello World!" message (or a 404, which is also fine).

Run docker ps to see your three containers running.

3. Development Roadmap (Tasks 2-8)

Follow these tasks in order. For all services, use the TDD workflow.

[ ] Task 2: Database & Entities

Goal: Define our data structure in code and sync it with the database.

Steps:

[ ] Install TypeORM, pg: npm install @nestjs/typeorm typeorm pg

[ ] Create a DatabaseModule (src/database/database.module.ts) to configure and establish the TypeORM connection (using values from .env).

[ ] Import DatabaseModule into AppModule.

[ ] Create all five entity files in src/database/entities/:

user.entity.ts

movie.entity.ts

genre.entity.ts

rating.entity.ts

watchlist.entity.ts

[ ] Verify: Restart your app (docker-compose restart api) and check your Postgres DB (using a tool like DBeaver or docker exec) to see that the tables have been created.

[ ] Task 3: Data Seeding from TMDB

Goal: Populate our empty database with real movie and genre data.

Steps:

[ ] Install @nestjs/axios: npm install @nestjs/axios axios

[ ] Create a SeedModule (src/seed/seed.module.ts) and SeedService.

[ ] Write logic in SeedService to fetch genres from TMDB and save them to your genre table.

[ ] Write logic to fetch popular movies from TMDB and save them to your movie table (making sure to link them to the genres in the movie_genre join table).

[ ] Create a way to run this seed (e.g., a simple npm run seed command that uses ts-node).

[ ] Task 4: Core Read Endpoints & API Docs (TDD)

Goal: Allow users to view the data. Start TDD here.

Steps:

[ ] Build MovieModule & GenreModule (Controller, Service, Module files).

[ ] (TDD) Implement GenreService and GenreController for GET /api/genres.

[ ] (TDD) Implement MovieService and MovieController for GET /api/movies/:id.

[ ] Create DTOs (Data Transfer Objects) with validation (class-validator, class-transformer) for pagination, search, and filter queries.

[ ] (TDD) Implement the complex GET /api/movies logic in MovieService (handling all query params).

[ ] Install @nestjs/swagger: npm install @nestjs/swagger

[ ] Add Swagger setup to src/main.ts and decorators to all DTOs and Controllers.

[ ] Verify: Check your Swagger docs at http://localhost:8080/api/docs.

[ ] Task 5: Authentication (TDD)

Goal: Allow users to register and log in.

Steps:

[ ] Build AuthModule & UserModule.

[ ] Install jwt, passport, bcrypt: npm install @nestjs/jwt @nestjs/passport passport-jwt bcrypt @types/bcrypt @types/passport-jwt

[ ] (TDD) Implement UserService (to create and find users).

[ ] (TDD) Implement AuthService logic for register (hashing passwords with bcrypt) and login (validating password and issuing a JWT).

[ ] Implement AuthController for POST /api/auth/register and POST /api/auth/login.

[ ] Create JwtStrategy and JwtAuthGuard to protect future routes.

[ ] Task 6: Core User Features (TDD)

Goal: Implement the main interactive features, secured by auth.

Steps:

[ ] Build RatingModule & WatchlistModule.

[ ] (TDD) Implement RatingService & RatingController for POST /api/movies/:id/rate.

[ ] (Critical Logic) Add logic to RatingService so that when a new rating is added, it re-calculates and updates the avg_rating field on the corresponding Movie entity. (TDD is perfect for this!).

[ ] (TDD) Implement WatchlistService & WatchlistController for GET, POST, DELETE on /api/users/me/watchlist.

[ ] Security: Add the @UseGuards(JwtAuthGuard) decorator to all new controller methods.

[ ] Task 7: Caching

Goal: Fulfill the non-functional requirement for caching.

Steps:

[ ] Install cache-manager & redis store: npm install @nestjs/cache-manager cache-manager cache-manager-redis-store

[ ] Create a global CacheModule (src/cache/cache.module.ts) that connects to your Redis container. Import it in AppModule.

[ ] Add the @UseInterceptors(CacheInterceptor) decorator to the controller methods for GET /api/movies/:id and GET /api/genres.

[ ] Verify: Use docker logs -f <redis-container-name> to see keys being set/read, or use a GUI like RedisInsight.

[ ] Task 8: Final Polish & Review

Goal: Ensure all requirements are met and the project is professional.

Steps:

[ ] Run npm run test:cov. Review the coverage report. Add tests to any services/controllers below 85%.

[ ] Write the final README.md (this is different from this file). This new README.md is for the user of your project. It must explain:

Project overview.

How to run (prerequisites, .env setup, docker-compose up).

A link to the Swagger API documentation.

Any key design decisions you made.

[ ] Check off all items in Section 1 of this document.

4. TDD Workflow (How to Build Each Feature)

Use this "Red-Green-Refactor" cycle for every piece of logic in Tasks 4-6.

RED (Write a Failing Test):

In the .spec.ts file (e.g., movie.service.spec.ts), write a new test (it(...)) for the logic you are about to add.

Run the test. It must fail (because the code doesn't exist).

GREEN (Write the Minimum Code to Pass):

In the .ts file (e.g., movie.service.ts), write the absolute minimum amount of code required to make the failing test pass.

Run the tests. They should all pass.

REFACTOR (Clean Up the Code):

Now that your tests are passing, you can safely clean up your code.

Make it more readable, remove duplication (DRY), etc.

Run the tests again to ensure they still pass.

Repeat this cycle for the next piece of logic.

5. Git & Branching Workflow

Branches:

main: Stable, production-ready code.

develop: Your main integration branch. All features merge here.

feat/...: A new branch for each task (e.g., feat/task-2-database).

Workflow (for each task):

# 1. Get the latest 'develop'

git checkout develop
git pull

# 2. Create your new task branch

git checkout -b feat/task-2-database

# 3. Do your work (coding, TDD, committing)

git add .
git commit -m "feat(database): create all 5 entities"

# 4. Push your branch

git push -u origin feat/task-2-database

# 5. Create a Pull Request (PR) on GitHub from your branch into 'develop'
