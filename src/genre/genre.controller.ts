import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { GenreService } from './genre.service';
import { Genre } from '../database/entities/genre.entity';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { HttpCacheInterceptor } from '../common/interceptors/http-cache.interceptor';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Genres')
@Controller('genres')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @UseInterceptors(HttpCacheInterceptor)
  @Get()
  @ApiOperation({ summary: 'Get all movie genres' })
  @ApiResponse({
    status: 200,
    description: 'List of all genres',
    type: [Genre],
  })
  async findAll(): Promise<Genre[]> {
    return this.genreService.findAll();
  }
}
