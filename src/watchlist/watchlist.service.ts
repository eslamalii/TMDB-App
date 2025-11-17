import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Watchlist } from '../database/entities/watchlist.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WatchlistService {
  constructor(
    @InjectRepository(Watchlist)
    private readonly watchlistRepository: Repository<Watchlist>,
  ) {}

  async addMovie(userId: number, movieId: number): Promise<Watchlist> {
    const entry = this.watchlistRepository.create({
      user: { id: userId },
      movie: { id: movieId },
    });

    try {
      return await this.watchlistRepository.save(entry);
    } catch (error) {
      if (error.code === '23505') return entry;
      throw error;
    }
  }

  async removeMovie(userId: number, movieId: number): Promise<void> {
    await this.watchlistRepository.delete({
      user: { id: userId },
      movie: { id: movieId },
    });
  }

  async getWatchlist(userId: number): Promise<Watchlist[]> {
    return this.watchlistRepository.find({
      where: { user: { id: userId } },
      relations: ['movie'],
    });
  }
}
