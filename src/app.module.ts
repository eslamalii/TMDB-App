import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { SeedModule } from './seed/seed.module';
import { GenreModule } from './genre/genre.module';
import { MovieModule } from './movie/movie.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { RatingModule } from './rating/rating.module';
import { WatchlistModule } from './watchlist/watchlist.module';
import { AppCacheModule } from './cache/cache.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_TTL_SECONDS || '60', 10),
        limit: parseInt(process.env.RATE_LIMIT || '100', 10),
      },
    ]),
    DatabaseModule,
    SeedModule,
    GenreModule,
    MovieModule,
    UserModule,
    AuthModule,
    RatingModule,
    WatchlistModule,
    AppCacheModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
