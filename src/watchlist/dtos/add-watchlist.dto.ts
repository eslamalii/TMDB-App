import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class AddWatchlistDto {
  @ApiProperty({
    description: 'The ID of the movie to add to your watchlist',
    example: 550,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  movieId: number;
}
