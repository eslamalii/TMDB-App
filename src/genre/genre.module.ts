import { Module } from '@nestjs/common';
import { GenreController } from './genre.controller';
import { GenreService } from './genre.service';
import { Genre } from '../database/entities/genre.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppCacheModule } from '../cache/cache.module';

@Module({
  imports: [TypeOrmModule.forFeature([Genre]), AppCacheModule],
  controllers: [GenreController],
  providers: [GenreService],
})
export class GenreModule {}
