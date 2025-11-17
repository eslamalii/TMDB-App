import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rating } from '../database/entities/rating.entity';
import { DataSource, Repository } from 'typeorm';
import { Movie } from '../database/entities/movie.entity';

@Injectable()
export class RatingService {
  private readonly logger = new Logger(RatingService.name);

  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    private readonly dataSource: DataSource,
  ) {}

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

      await this.recalculateMovieAverage(movieId, manager);

      return newRating;
    });
  }

  /*
  While this approach works, it slightly violates the Single Responsibility Principle (SRP) as the service is handling both rating updates and movie average recalculations. 
  In larger applications, it is better to separate these concerns, potentially using Domain Events to decouple the logic.
  */
  private async recalculateMovieAverage(
    movieId: number,
    manager?: any,
  ): Promise<void> {
    const ratingRepo = manager
      ? manager.getRepository(Rating)
      : this.ratingRepository;
    const movieRepo = manager
      ? manager.getRepository(Movie)
      : this.movieRepository;

    const allRatings = await ratingRepo.find({
      where: { movie: { id: movieId } },
    });

    if (allRatings.length === 0) {
      await movieRepo.update(movieId, { avg_rating: 0 });
    }

    const totalScore = allRatings.reduce(
      (sum: number, rating: Rating) => sum + rating.score,
      0,
    );

    const newAverage = totalScore / allRatings.length;

    await movieRepo.update(
      { id: movieId },
      { avg_rating: parseFloat(newAverage.toFixed(1)) },
    );
  }
}
