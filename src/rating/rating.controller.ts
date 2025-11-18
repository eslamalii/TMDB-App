import {
  Body,
  Controller,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { RatingService } from './rating.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RateMovieDto } from './dtos/rate-movie.dto';
import { User } from '../database/entities/user.entity';

@ApiTags('Ratings')
@ApiBearerAuth('Bearer')
@Controller()
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @UseGuards(JwtAuthGuard)
  @Post('movies/:id/rate')
  @ApiOperation({
    summary: 'Rate a movie',
    description:
      'Add or update your rating for a movie (1-10). Requires authentication.',
  })
  @ApiParam({ name: 'id', description: 'Movie ID', example: 550 })
  @ApiResponse({
    status: 201,
    description: 'Rating successfully added/updated',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
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
