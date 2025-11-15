import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const seedService = app.get(SeedService);
    console.log('Starting the seed process...');
    await seedService.seedAll();
    console.log('Seed process finished successfully.');
  } catch (error) {
    console.error('Error during seed process:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
