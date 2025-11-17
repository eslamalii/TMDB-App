import { Test, TestingModule } from '@nestjs/testing';
import { WatchlistService } from './watchlist.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Watchlist } from '../database/entities/watchlist.entity';

const mockEntry = { user: { id: 1 }, movie: { id: 101 } };

const mockWatchlistRepository = {
  save: jest.fn().mockResolvedValue(mockEntry),
  delete: jest.fn().mockResolvedValue({}),
  find: jest.fn().mockResolvedValue([mockEntry]),
  create: jest.fn((data) => data),
};

describe('WatchlistService', () => {
  let service: WatchlistService;
  let repository: typeof mockWatchlistRepository;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchlistService,
        {
          provide: getRepositoryToken(Watchlist),
          useValue: mockWatchlistRepository,
        },
      ],
    }).compile();

    service = module.get<WatchlistService>(WatchlistService);
    repository = mockWatchlistRepository;
  });

  describe('addMovie', () => {
    it('should add a movie to the watchlist', async () => {
      const result = await service.addMovie(1, 101);
      expect(result).toEqual(mockEntry);
      expect(repository.create).toHaveBeenCalledWith({
        user: { id: 1 },
        movie: { id: 101 },
      });
      expect(repository.save).toHaveBeenCalledWith(mockEntry);
    });

    it('should return entry if duplicate error occurs', async () => {
      repository.save.mockRejectedValueOnce({ code: '23505' });
      const result = await service.addMovie(1, 101);
      expect(result).toEqual(mockEntry);
    });
  });

  describe('removeMovie', () => {
    it('should remove a movie from the watchlist', async () => {
      await service.removeMovie(1, 101);
      expect(repository.delete).toHaveBeenCalledWith({
        user: { id: 1 },
        movie: { id: 101 },
      });
    });
  });

  describe('getWatchlist', () => {
    it('should get the user watchlist', async () => {
      const result = await service.getWatchlist(1);
      expect(result).toEqual([mockEntry]);
      expect(repository.find).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
        relations: ['movie'],
      });
    });
  });
});
