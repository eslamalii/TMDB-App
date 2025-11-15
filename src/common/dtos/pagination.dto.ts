import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit: number = 20;

  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset: number = 0;
}
