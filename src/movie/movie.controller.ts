import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { MovieService } from './movie.service';
import { Movie } from '../database/entities/movie.entity';
import { FilterMovieDto } from '../common/dtos/filter.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { HttpCacheInterceptor } from '../common/interceptors/http-cache.interceptor';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MovieListResponseDto } from './dtos/movie-list-response.dto';

@ApiTags('Movies')
@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @UseInterceptors(HttpCacheInterceptor)
  @Get()
  @ApiOperation({
    summary: 'Get all movies',
    description:
      'Returns a list of movies. Supports pagination and filtering by title search and genre.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of movies',
    type: MovieListResponseDto,
  })
  async findAll(
    @Query() movieDto: FilterMovieDto,
  ): Promise<MovieListResponseDto> {
    const { items, meta } = await this.movieService.findAll(movieDto);
    return { items, meta };
  }

  @UseInterceptors(CacheInterceptor)
  @Get(':id')
  @ApiOperation({ summary: 'Get a movie by ID' })
  @ApiParam({ name: 'id', description: 'Movie ID', example: 550 })
  @ApiResponse({ status: 200, description: 'Movie details', type: Movie })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  async findOne(@Param('id') id: string): Promise<Movie> {
    return this.movieService.findOne(+id);
  }
}
