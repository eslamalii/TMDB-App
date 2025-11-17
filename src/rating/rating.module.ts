import { Module } from '@nestjs/common';
import { RatingController } from './rating.controller';
import { RatingService } from './rating.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rating } from '../database/entities/rating.entity';
import { Movie } from '../database/entities/movie.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, Movie])],
  controllers: [RatingController],
  providers: [RatingService],
})
export class RatingModule {}
