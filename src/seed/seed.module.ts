import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Genre } from '../database/entities/genre.entity';
import { Movie } from '../database/entities/movie.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [ConfigModule, HttpModule, TypeOrmModule.forFeature([Movie, Genre])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
