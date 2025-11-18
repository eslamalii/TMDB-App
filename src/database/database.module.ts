import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbSync = configService.get<string>('DB_SYNC');
        const nodeEnv = configService.get<string>('NODE_ENV');
        return {
          type: 'postgres',
          host: configService.get<string>('DATABASE_HOST'),
          port: configService.get<number>('DATABASE_PORT'),
          username: configService.get<string>('POSTGRES_USER'),
          password: configService.get<string>('POSTGRES_PASSWORD'),
          database: configService.get<string>('POSTGRES_DB'),

          entities: [__dirname + '/entities/*.entity{.ts,.js}'],

          // Default to false; allow override via DB_SYNC=true for dev only
          synchronize:
            typeof dbSync === 'string'
              ? dbSync.toLowerCase() === 'true'
              : nodeEnv !== 'production',
          // Avoid verbose SQL logs in production unless explicitly enabled
          logging: configService.get<string>('DB_LOGGING', 'false') === 'true',
        };
      },
    }),
  ],
})
export class DatabaseModule {}
