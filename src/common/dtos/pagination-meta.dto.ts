import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ description: 'Total number of items', example: 237 })
  total: number;

  @ApiProperty({ description: 'Requested page size (limit)', example: 20 })
  limit: number;

  @ApiProperty({ description: 'Requested offset', example: 0 })
  offset: number;

  @ApiProperty({ description: 'Current page number (1-based)', example: 1 })
  page: number;

  @ApiProperty({ description: 'Total number of pages', example: 12 })
  pages: number;
}
