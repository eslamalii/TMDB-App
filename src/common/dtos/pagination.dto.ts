import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Max items to return',
    default: 20,
    minimum: 1,
    example: 20,
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit: number = 20;

  @ApiPropertyOptional({
    description: 'Number of items to skip',
    default: 0,
    minimum: 0,
    example: 0,
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset: number = 0;
}
