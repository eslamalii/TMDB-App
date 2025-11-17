import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { GenreService } from './genre.service';
import { Genre } from '../database/entities/genre.entity';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('genres')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @UseInterceptors(CacheInterceptor)
  @Get()
  async findAll(): Promise<Genre[]> {
    return this.genreService.findAll();
  }
}
