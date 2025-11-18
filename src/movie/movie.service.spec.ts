import { MovieService } from './movie.service';
import { Movie } from '../database/entities/movie.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FilterMovieDto } from '../common/dtos/filter.dto';

const mockMovie = { id: 1, title: 'Fight Club' } as any;

const createMockQueryBuilder = () => {
  const mockQb: any = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    distinct: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([mockMovie]),
    getOne: jest.fn(),
    getCount: jest.fn().mockResolvedValue(1),
    clone: jest.fn(),
  };
  mockQb.clone.mockReturnValue(mockQb);
  return mockQb;
};

describe('MovieService', () => {
  // Note: Constructor and DI decorators are not covered in unit tests
  // as they are framework-level concerns tested by NestJS itself.
  // Our tests focus on business logic after DI is resolved.

  let service: MovieService;
  let mockQueryBuilder: ReturnType<typeof createMockQueryBuilder>;
  let repository: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockQueryBuilder = createMockQueryBuilder();
    repository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        { provide: getRepositoryToken(Movie), useValue: repository },
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return movies with default pagination', async () => {
      const result = await service.findAll({} as FilterMovieDto);

      expect(result.items).toEqual([mockMovie]);
      expect(result.meta).toEqual({
        total: 1,
        limit: 20,
        offset: 0,
        page: 1,
        pages: 1,
      });
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });

    it('should use custom pagination params', async () => {
      await service.findAll({ offset: 10, limit: 5 } as FilterMovieDto);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
    });

    it('should apply search filter', async () => {
      await service.findAll({ search: 'fight' } as FilterMovieDto);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'movie.title ILIKE :search',
        { search: '%fight%' },
      );
    });

    it('should apply genre filter', async () => {
      await service.findAll({ genre: 'Action' } as FilterMovieDto);

      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith(
        'movie.genres',
        'genre',
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'genre.name = :genre',
        { genre: 'Action' },
      );
      expect(mockQueryBuilder.distinct).toHaveBeenCalledWith(true);
    });

    it('should apply both search and genre filters', async () => {
      await service.findAll({
        search: 'club',
        genre: 'Drama',
      } as FilterMovieDto);

      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
      expect(mockQueryBuilder.distinct).toHaveBeenCalledWith(true);
    });

    it('should handle empty filters', async () => {
      await service.findAll({} as FilterMovieDto);

      expect(mockQueryBuilder.where).not.toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
      expect(mockQueryBuilder.leftJoin).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a movie when found', async () => {
      repository.findOne.mockResolvedValue(mockMovie);

      const result = await service.findOne(1);

      expect(result).toEqual(mockMovie);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if movie not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        'Movie with the given ID not found',
      );
    });
  });
});
