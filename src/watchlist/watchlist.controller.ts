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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WatchlistService } from './watchlist.service';
import { User } from 'src/database/entities/user.entity';
import { AddWatchlistDto } from './dtos/add-watchlist.dto';

@ApiTags('User Watchlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/me/watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get()
  async getWatchlist(@Request() req: any) {
    const user = req.user as User;
    return this.watchlistService.getWatchlist(user.id);
  }

  @Post()
  async addMovieToWatchlist(
    @Request() req: any,
    @Body() addWatchlistDto: AddWatchlistDto,
  ) {
    const user = req.user as User;
    return this.watchlistService.addMovie(user.id, addWatchlistDto.movieId);
  }

  @Delete(':movieId')
  async removeMovieFromWatchlist(
    @Request() req,
    @Param('movieId') movieId: string,
  ) {
    const user = req.user as User;
    await this.watchlistService.removeMovie(user.id, +movieId);
    return { message: 'Movie removed from watchlist' };
  }
}
