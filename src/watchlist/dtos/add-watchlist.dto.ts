import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class AddWatchlistDto {
  @ApiProperty({
    description: 'The ID of the movie to add',
    example: 550,
  })
  @IsInt()
  @IsPositive()
  movieId: number;
}
