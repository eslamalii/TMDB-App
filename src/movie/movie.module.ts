import { Module } from '@nestjs/common';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from '../database/entities/movie.entity';
import { AppCacheModule } from '../cache/cache.module';

@Module({
  imports: [TypeOrmModule.forFeature([Movie]), AppCacheModule],
  controllers: [MovieController],
  providers: [MovieService],
})
export class MovieModule {}
