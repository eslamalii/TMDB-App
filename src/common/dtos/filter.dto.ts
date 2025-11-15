import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from './pagination.dto';
import { IsOptional, IsString } from 'class-validator';

export class FilterMovieDto extends PaginationQueryDto {
  @ApiProperty({
    description: 'Search term to filter movies by title',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Genre to filter movies',
    required: false,
    example: 'Action',
  })
  @IsOptional()
  @IsString()
  genre?: string;
}
