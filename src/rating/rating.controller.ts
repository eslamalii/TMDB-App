import {
  Body,
  Controller,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RatingService } from './rating.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RateMovieDto } from './dtos/rate-movie.dto';
import { User } from 'src/database/entities/user.entity';

@ApiTags('Ratings')
@ApiBearerAuth()
@Controller()
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @UseGuards(JwtAuthGuard)
  @Post('movies/:id/rate')
  async rateMovie(
    @Request() req: any,
    @Param('id') movieId: string,
    @Body() rateMovieDto: RateMovieDto,
  ) {
    const user = req.user as User;
    return this.ratingService.addOrUpdateRating(
      user.id,
      +movieId,
      rateMovieDto.score,
    );
  }
}
