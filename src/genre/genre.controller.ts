import { Controller, Get } from '@nestjs/common';
import { GenreService } from './genre.service';
import { Genre } from '../database/entities/genre.entity';

@Controller('genres')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @Get()
  async findAll(): Promise<Genre[]> {
    return this.genreService.findAll();
  }
}
