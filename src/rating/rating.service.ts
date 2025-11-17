import { Injectable, Logger } from '@nestjs/common';
import { Rating } from '../database/entities/rating.entity';
import { DataSource, Repository } from 'typeorm';
import { Movie } from '../database/entities/movie.entity';

@Injectable()
export class RatingService {
  private readonly logger = new Logger(RatingService.name);

  constructor(private readonly dataSource: DataSource) {}

  async addOrUpdateRating(
    userId: number,
    movieId: number,
    score: number,
  ): Promise<Rating> {
    return this.dataSource.transaction(async (manager) => {
      const newRating = await manager.save(Rating, {
        user: { id: userId },
        movie: { id: movieId },
        score,
      });

      await this.recalculateMovieAverage(
        movieId,
        manager.getRepository(Rating),
        manager.getRepository(Movie),
      );

      return newRating;
    });
  }

  private async recalculateMovieAverage(
    movieId: number,
    ratingRepo: Repository<Rating>,
    movieRepo: Repository<Movie>,
  ): Promise<void> {
    try {
      const allRatings = await ratingRepo.find({
        where: { movie: { id: movieId } },
      });

      let avg = 0;
      if (allRatings.length > 0) {
        const totalScore = allRatings.reduce(
          (sum: number, rating: Rating) => sum + rating.score,
          0,
        );
        avg = totalScore / allRatings.length;
      }

      await movieRepo.update(
        { id: movieId },
        { avg_rating: parseFloat(avg.toFixed(1)) },
      );
    } catch (error) {
      this.logger.error('Failed to recalculate movie average rating', error);
    }
  }
}
