import { Test, TestingModule } from '@nestjs/testing';
import { GenreService } from './genre.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Genre } from '../database/entities/genre.entity';

// Mock data for our genre
const mockGenre = { id: 1, tmdb_id: 28, name: 'Action' };

// Mock the TypeORM Repository
const mockGenreRepository = {
  find: jest.fn().mockResolvedValue([mockGenre]),
};

describe('GenreService', () => {
  // Note: Constructor and DI decorators are not covered in unit tests
  // as they are framework-level concerns tested by NestJS itself.
  // Our tests focus on business logic after DI is resolved.

  let service: GenreService;
  let repository: typeof mockGenreRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenreService,
        { provide: getRepositoryToken(Genre), useValue: mockGenreRepository },
      ],
    }).compile();

    service = module.get<GenreService>(GenreService);
    repository = mockGenreRepository;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of genres', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockGenre]);
      expect(repository.find).toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      repository.find.mockRejectedValueOnce(new Error('db-error'));
      await expect(service.findAll()).rejects.toThrow('db-error');
    });
  });
});
