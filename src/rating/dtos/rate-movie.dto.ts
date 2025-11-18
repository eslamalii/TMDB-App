import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class RateMovieDto {
  @ApiProperty({
    description: 'Your rating for the movie (1 = worst, 10 = best)',
    example: 8,
    minimum: 1,
    maximum: 10,
  })
  @IsInt()
  @Min(1)
  @Max(10)
  score: number;
}
