import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from '../database/entities/movie.entity';
import { Repository } from 'typeorm';
import { FilterMovieDto } from '../common/dtos/filter.dto';
import { PaginationMetaDto } from 'src/common/dtos/pagination-meta.dto';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async findOne(id: number): Promise<Movie> {
    const movie = await this.movieRepository.findOne({ where: { id } });

    if (!movie) {
      throw new NotFoundException('Movie with the given ID not found');
    }

    return movie;
  }

  async findAll(
    movieDto: FilterMovieDto,
  ): Promise<{ items: Movie[]; meta: PaginationMetaDto }> {
    const { offset = 0, limit = 20, search, genre } = movieDto;

    const baseQb = this.movieRepository.createQueryBuilder('movie');

    if (search) {
      baseQb.where('movie.title ILIKE :search', { search: `%${search}%` });
    }

    if (genre) {
      baseQb
        .leftJoin('movie.genres', 'genre')
        .andWhere('genre.name = :genre', { genre });
      baseQb.distinct(true);
    }

    const total = await baseQb.getCount();

    const items = await baseQb.clone().skip(offset).take(limit).getMany();

    const safeLimit = Math.max(1, Number(limit));
    const page = Math.floor(Number(offset) / safeLimit) + 1;
    const pages = Math.max(1, Math.ceil(total / safeLimit));

    return {
      items,
      meta: { total, limit: safeLimit, offset: Number(offset), page, pages },
    };
  }
}
