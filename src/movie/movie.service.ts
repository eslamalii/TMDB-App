import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from '../database/entities/movie.entity';
import { Repository } from 'typeorm';
import { FilterMovieDto } from 'src/common/dtos/filter.dto';

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

  async findAll(movieDto: FilterMovieDto): Promise<Movie[]> {
    const { offset = 0, limit = 20, search, genre } = movieDto;

    const query = this.movieRepository.createQueryBuilder('movie');

    if (search) {
      query.where('movie.title ILIKE :search', { search: `%${search}%` });
    }

    if (genre) {
      query
        .leftJoinAndSelect('movie.genres', 'genre')
        .andWhere('genre.name = :genre', { genre });
    }

    query.skip(offset).take(limit);

    return await query.getMany();
  }
}
