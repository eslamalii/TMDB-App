import { Repository } from 'typeorm';
import { MovieService } from './movie.service';
import { Movie } from '../database/entities/movie.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FilterMovieDto } from 'src/common/dtos/filter.dto';

describe('findAll', () => {
  let service: MovieService;
  let repository: jest.Mocked<Repository<Movie>>;
  let mockQueryBuilder: any;

  const mockMovie = { id: 1, title: 'Fight Club' } as any;

  beforeEach(async () => {
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockMovie]),
    };

    repository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        { provide: getRepositoryToken(Movie), useValue: repository },
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
  });

  it('should return an array of movies with default pagination', async () => {
    const movieDto = {} as FilterMovieDto;
    const result = await service.findAll(movieDto);

    expect(result).toEqual([mockMovie]);
    expect(repository.createQueryBuilder).toHaveBeenCalledWith('movie');
    expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
    expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
    expect(mockQueryBuilder.getMany).toHaveBeenCalled();
  });

  it('should use DTO pagination params', async () => {
    const movieDto = { offset: 10, limit: 5 };
    await service.findAll(movieDto);

    expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
    expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
  });

  it('should apply search filter', async () => {
    const movieDto = { search: 'fight' } as FilterMovieDto;
    await service.findAll(movieDto);

    // Check that 'where' was called with the search term
    expect(mockQueryBuilder.where).toHaveBeenCalledWith(
      'movie.title ILIKE :search',
      { search: `%fight%` },
    );
  });

  it('should apply genre filter', async () => {
    const movieDto = { genre: 'Action' } as FilterMovieDto;
    await service.findAll(movieDto);

    // Check that it joins genres
    expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
      'movie.genres',
      'genre',
    );
    // Check that it filters by genre name
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      'genre.name = :genre',
      { genre: 'Action' },
    );
  });
});
