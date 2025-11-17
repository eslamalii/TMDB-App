import { Test, TestingModule } from '@nestjs/testing';
import { RatingService } from './rating.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Rating } from '../database/entities/rating.entity';
import { Movie } from '../database/entities/movie.entity';
import { DataSource } from 'typeorm';

const mockMovie = { id: 1, title: 'Test Movie', avg_rating: 0 };
const existingRatings = [
  { id: 1, movie: mockMovie, user: { id: 2 }, score: 8 },
  { id: 2, movie: mockMovie, user: { id: 3 }, score: 10 },
];
const newRating = { id: 3, movie: mockMovie, user: { id: 1 }, score: 6 };

const mockRatingRepository = {
  save: jest.fn().mockResolvedValue(newRating),
  find: jest.fn().mockResolvedValue([...existingRatings, newRating]),
};

const mockMovieRepository = {
  update: jest.fn().mockResolvedValue(true),
};

// Mock DataSource with transaction support
const mockDataSource = {
  transaction: jest.fn((cb) => {
    // Mock EntityManager passed to the transaction callback
    const mockManager = {
      save: jest.fn().mockResolvedValue(newRating),
      getRepository: jest.fn((entity) => {
        if (entity === Rating) return mockRatingRepository;
        if (entity === Movie) return mockMovieRepository;
      }),
    };
    return cb(mockManager);
  }),
};

describe('RatingService', () => {
  let service: RatingService;
  let movieRepository: typeof mockMovieRepository;
  let ratingRepository: typeof mockRatingRepository;
  let dataSource: typeof mockDataSource;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingService,
        {
          provide: getRepositoryToken(Rating),
          useValue: mockRatingRepository,
        },
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<RatingService>(RatingService);
    movieRepository = mockMovieRepository;
    ratingRepository = mockRatingRepository;
    dataSource = mockDataSource;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // This is our TDD test for the core business logic
  describe('addOrUpdateRating', () => {
    it('should save the rating AND update the movie average', async () => {
      const userId = 1;
      const movieId = 1;
      const score = 6;

      const result = await service.addOrUpdateRating(userId, movieId, score);

      expect(result).toEqual(newRating);
      expect(dataSource.transaction).toHaveBeenCalled();

      const transactionCallback = mockDataSource.transaction.mock.calls[0][0];
      const mockManager = {
        save: jest.fn().mockResolvedValue(newRating),
        getRepository: jest.fn((entity) => {
          if (entity === Rating) return mockRatingRepository;
          if (entity === Movie) return mockMovieRepository;
        }),
      };

      await transactionCallback(mockManager);

      expect(mockManager.save).toHaveBeenCalledWith(Rating, {
        user: { id: userId },
        movie: { id: movieId },
        score: score,
      });

      expect(mockRatingRepository.find).toHaveBeenCalledWith({
        where: { movie: { id: movieId } },
      });

      const newAverage = 8;
      expect(mockMovieRepository.update).toHaveBeenCalledWith(
        { id: movieId },
        { avg_rating: newAverage },
      );
    });
  });
});
