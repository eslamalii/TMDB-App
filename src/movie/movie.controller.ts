import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { MovieService } from './movie.service';
import { Movie } from '../database/entities/movie.entity';
import { FilterMovieDto } from 'src/common/dtos/filter.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  async findAll(@Query() movieDto: FilterMovieDto): Promise<Movie[]> {
    return this.movieService.findAll(movieDto);
  }

  @UseInterceptors(CacheInterceptor)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Movie> {
    return this.movieService.findOne(+id);
  }
}
