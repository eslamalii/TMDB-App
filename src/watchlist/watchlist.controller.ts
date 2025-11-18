import {
  Body,
  Controller,
  Delete,
  Get,
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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WatchlistService } from './watchlist.service';
import { User } from '../database/entities/user.entity';
import { AddWatchlistDto } from './dtos/add-watchlist.dto';

@ApiTags('User Watchlist')
@ApiBearerAuth('Bearer')
@UseGuards(JwtAuthGuard)
@Controller('users/me/watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get()
  @ApiOperation({
    summary: 'Get my watchlist',
    description:
      'Returns all movies in your personal watchlist. Requires authentication.',
  })
  @ApiResponse({ status: 200, description: 'List of movies in watchlist' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  async getWatchlist(@Request() req: any) {
    const user = req.user as User;
    return this.watchlistService.getWatchlist(user.id);
  }

  @Post()
  @ApiOperation({
    summary: 'Add a movie to watchlist',
    description:
      'Add a movie to your personal watchlist. Requires authentication.',
  })
  @ApiResponse({ status: 201, description: 'Movie added to watchlist' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  async addMovieToWatchlist(
    @Request() req: any,
    @Body() addWatchlistDto: AddWatchlistDto,
  ) {
    const user = req.user as User;
    return this.watchlistService.addMovie(user.id, addWatchlistDto.movieId);
  }

  @Delete(':movieId')
  @ApiOperation({
    summary: 'Remove a movie from watchlist',
    description:
      'Remove a movie from your personal watchlist. Requires authentication.',
  })
  @ApiParam({
    name: 'movieId',
    description: 'Movie ID to remove',
    example: 550,
  })
  @ApiResponse({ status: 200, description: 'Movie removed from watchlist' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  async removeMovieFromWatchlist(
    @Request() req: any,
    @Param('movieId') movieId: string,
  ) {
    const user = req.user as User;
    await this.watchlistService.removeMovie(user.id, +movieId);
    return { message: 'Movie removed from watchlist' };
  }
}
