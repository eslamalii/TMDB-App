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
  let service: GenreService;
  let repository: typeof mockGenreRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

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
    repository = mockGenreRepository;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of genres', async () => {
      const genres = await service.findAll();
      expect(genres).toEqual([mockGenre]);
      expect(repository.find).toHaveBeenCalled();
    });
  });
});
