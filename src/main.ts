import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Set a global prefix for all routes (e.g., /api)
  app.setGlobalPrefix('api');

  // Security headers via Helmet
  app.use(helmet());

  // CORS (restrict origins via env ALLOWED_ORIGINS="http://localhost:3000,http://localhost:8080")
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  app.enableCors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger setup (disabled in production by default)
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.ENABLE_SWAGGER === 'true'
  ) {
    const config = new DocumentBuilder()
      .setTitle('TMDB Movie API')
      .setDescription(
        'A comprehensive movie database API with user authentication, ratings, and watchlist management.\n\n' +
          '**Getting Started:**\n' +
          '1. Register a new account at `/api/auth/register`\n' +
          '2. Login at `/api/auth/login` to get your JWT token\n' +
          '3. Click "Authorize" 🔓 and paste your JWT token (no "Bearer " prefix)\n' +
          '4. Now you can rate movies and manage your watchlist!\n\n' +
          '**Public Endpoints:** Movies, Genres (no auth required)\n' +
          '**Protected Endpoints:** Ratings, Watchlist (JWT required)',
      )
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'Bearer',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const port = process.env.PORT || 3000;

  await app.listen(port);

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
