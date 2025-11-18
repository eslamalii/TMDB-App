import { ApiProperty } from '@nestjs/swagger';
import { Movie } from '../../database/entities/movie.entity';
import { PaginationMetaDto } from '../../common/dtos/pagination-meta.dto';

export class MovieListResponseDto {
  @ApiProperty({ type: [Movie] })
  items: Movie[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
