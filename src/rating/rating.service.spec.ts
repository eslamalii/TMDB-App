import { Test, TestingModule } from '@nestjs/testing';
import { RatingService } from './rating.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Rating } from '../database/entities/rating.entity';
import { Movie } from '../database/entities/movie.entity';
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';

const mockMovie = { id: 1, title: 'Test Movie', avg_rating: 0 };
const existingRatings = [
  { id: 1, movie: mockMovie, user: { id: 2 }, score: 8 },
  { id: 2, movie: mockMovie, user: { id: 3 }, score: 10 },
];
const newRating = { id: 3, movie: mockMovie, user: { id: 1 }, score: 6 };

const createMockRepositories = (
  ratingsToReturn = [...existingRatings, newRating],
) => ({
  rating: {
    save: jest.fn().mockResolvedValue(newRating),
    find: jest.fn().mockResolvedValue(ratingsToReturn),
  },
  movie: {
    update: jest.fn().mockResolvedValue(true),
  },
});

const createMockDataSource = (ratingRepo: any, movieRepo: any) => ({
  transaction: jest.fn((cb) =>
    cb({
      save: jest.fn().mockResolvedValue(newRating),
      getRepository: (entity: any) =>
        entity === Rating ? ratingRepo : movieRepo,
    }),
  ),
});

describe('RatingService', () => {
  let service: RatingService;
  let mockRatingRepository: ReturnType<typeof createMockRepositories>['rating'];
  let mockMovieRepository: ReturnType<typeof createMockRepositories>['movie'];
  let mockDataSource: ReturnType<typeof createMockDataSource>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const repos = createMockRepositories();
    mockRatingRepository = repos.rating;
    mockMovieRepository = repos.movie;
    mockDataSource = createMockDataSource(
      mockRatingRepository,
      mockMovieRepository,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingService,
        { provide: getRepositoryToken(Rating), useValue: mockRatingRepository },
        { provide: getRepositoryToken(Movie), useValue: mockMovieRepository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<RatingService>(RatingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addOrUpdateRating', () => {
    it('should save rating and update movie average', async () => {
      const result = await service.addOrUpdateRating(1, 1, 6);

      expect(result).toEqual(newRating);
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockMovieRepository.update).toHaveBeenCalledWith(
        { id: 1 },
        { avg_rating: 8 }, // (8 + 10 + 6) / 3 = 8
      );
    });

    it('should set avg_rating to 0 when no ratings exist', async () => {
      const repos = createMockRepositories([]);
      const ds = createMockDataSource(repos.rating, repos.movie);

      const module = await Test.createTestingModule({
        providers: [
          RatingService,
          { provide: getRepositoryToken(Rating), useValue: repos.rating },
          { provide: getRepositoryToken(Movie), useValue: repos.movie },
          { provide: DataSource, useValue: ds },
        ],
      }).compile();

      const localService = module.get<RatingService>(RatingService);
      await localService.addOrUpdateRating(1, 1, 5);

      expect(repos.movie.update).toHaveBeenCalledWith(
        { id: 1 },
        { avg_rating: 0 },
      );
    });

    it('should log error during recalculation and still resolve', async () => {
      const errorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();
      mockRatingRepository.find.mockRejectedValueOnce(new Error('Find Failed'));

      const result = await service.addOrUpdateRating(1, 1, 5);

      expect(result).toEqual(newRating);
      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to recalculate movie average rating',
        expect.any(Error),
      );

      errorSpy.mockRestore();
    });
  });
});
