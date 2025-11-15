import { Test, TestingModule } from '@nestjs/testing';
import { GenreService } from './genre.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Genre } from '../database/entities/genre.entity';
import { Repository } from 'typeorm';

// Mock data for our genre
const mockGenre = { id: 1, tmdb_id: 28, name: 'Action' };

// Mock the TypeORM Repository
const mockGenreRepository = {
  find: jest.fn().mockResolvedValue([mockGenre]),
};

describe('GenreService', () => {
  let service: GenreService;
  let repository: Repository<Genre>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenreService,
        {
          provide: getRepositoryToken(Genre),
          useValue: mockGenreRepository,
        },
      ],
    }).compile();

    service = module.get<GenreService>(GenreService);
    repository = module.get<Repository<Genre>>(getRepositoryToken(Genre));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // This is our first test. It will fail.
  describe('findAll', () => {
    it('should return an array of genres', async () => {
      // Act
      const genres = await service.findAll();

      // Assert
      expect(genres).toEqual([mockGenre]);
      expect(repository.find).toHaveBeenCalled();
    });
  });
});
