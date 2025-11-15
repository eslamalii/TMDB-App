import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import * as https from 'https';

import { Movie } from '../database/entities/movie.entity';
import { Genre } from '../database/entities/genre.entity';

type TmdbGenre = { id: number; name: string };
type TmdbGenreListResponse = { genres: TmdbGenre[] };

type TmdbMovie = {
  id: number;
  title: string;
  overview: string;
  release_date?: string;
  poster_path?: string | null;
  vote_average: number; // 0..10
  genre_ids?: number[];
};

type TmdbPaginated<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);
  private readonly apiKey: string;
  private readonly baseURL = 'https://api.themoviedb.org/3';
  private readonly pagesToSeed: number;

  // Optional: allow insecure TLS only if explicitly enabled for dev
  private readonly httpsAgent =
    process.env.ALLOW_INSECURE_TLS === '1'
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    @InjectRepository(Movie) private readonly movies: Repository<Movie>,
    @InjectRepository(Genre) private readonly genres: Repository<Genre>,
  ) {
    this.apiKey = this.config.get<string>('TMDB_API_KEY') || '';
    if (!this.apiKey) throw new Error('TMDB_API_KEY is not defined');

    this.pagesToSeed = Number(this.config.get('SEED_POPULAR_PAGES') ?? 1);
  }

  async seedAll() {
    this.logger.log('Starting database seed...');
    await this.seedGenres();
    await this.seedMovies();
    this.logger.log('Database seed complete!');
  }

  // Generic GET wrapper with timeout and basic logging
  private async get<T>(endpoint: string, params?: Record<string, unknown>) {
    const url = `${this.baseURL}/${endpoint}`;
    const started = Date.now();

    try {
      const res = await firstValueFrom(
        this.http.get<T>(url, {
          params: { api_key: this.apiKey, ...params },
          timeout: 15000,
          httpsAgent: this.httpsAgent,
          // Helpful header for some corp proxies
          headers: { 'User-Agent': 'tmdb-app-seeder/1.0' },
        }),
      );
      this.logger.debug(`GET ${endpoint} (${Date.now() - started}ms) -> OK`);
      return res.data;
    } catch (err: any) {
      const msg = err?.message || 'Unknown error';
      this.logger.error(`GET ${endpoint} failed: ${msg}`, err?.stack);
      throw err;
    }
  }

  private async seedGenres() {
    this.logger.log('Seeding genres...');
    const data = await this.get<TmdbGenreListResponse>('genre/movie/list');

    // Upsert genres by tmdb_id to keep it idempotent
    const rows = (data.genres || []).map((g) => ({
      tmdb_id: g.id,
      name: g.name,
    }));

    if (rows.length === 0) {
      this.logger.warn('No genres returned from TMDB.');
      return;
    }

    await this.genres.upsert(rows, ['tmdb_id']);

    const count = await this.genres.count();
    this.logger.log(`Genres in DB: ${count}`);
  }

  private async seedMovies() {
    this.logger.log(`Seeding popular movies (pages=${this.pagesToSeed})...`);

    // Cache DB genres by tmdb_id for quick lookup
    const dbGenres = await this.genres.find();
    const genreByTmdbId = new Map<number, Genre>(
      dbGenres.map((g) => [g.tmdb_id, g]),
    );

    // Fetch pages of popular movies
    const allMovies: TmdbMovie[] = [];
    const pages = Math.max(1, this.pagesToSeed);

    for (let page = 1; page <= pages; page++) {
      const { results } = await this.get<TmdbPaginated<TmdbMovie>>(
        'movie/popular',
        { page },
      );
      allMovies.push(...(results || []));
    }

    // De-duplicate by tmdb id
    const uniqueById = new Map<number, TmdbMovie>();
    for (const m of allMovies) uniqueById.set(m.id, m);
    const uniqueMovies = Array.from(uniqueById.values());

    if (uniqueMovies.length === 0) {
      this.logger.warn('No movies returned from TMDB.');
      return;
    }

    // Upsert base movie fields first
    const upsertRows = uniqueMovies.map((m) => ({
      tmdb_id: m.id,
      title: m.title ?? '',
      overview: m.overview ?? '',
      release_date: m.release_date ? new Date(m.release_date) : new Date(), // field is non-nullable
      poster_path: m.poster_path ?? undefined,
      avg_rating: Number.isFinite(m.vote_average) ? m.vote_average : 0,
    }));

    await this.movies.upsert(upsertRows, ['tmdb_id']);

    // Fetch saved movies so we have DB ids to attach relations
    const ids = uniqueMovies.map((m) => m.id);
    const saved = await this.movies.find({
      where: { tmdb_id: In(ids) },
      relations: ['genres'],
    });

    // Attach genres for each movie
    const savedByTmdb = new Map<number, Movie>(
      saved.map((m) => [m.tmdb_id, m]),
    );

    for (const m of uniqueMovies) {
      const movieEntity = savedByTmdb.get(m.id);
      if (!movieEntity) continue;

      const genreEntities = (m.genre_ids || [])
        .map((gid) => genreByTmdbId.get(gid))
        .filter(Boolean) as Genre[];

      // Only update relation if it changed to avoid unnecessary writes
      const currentIds = new Set((movieEntity.genres || []).map((g) => g.id));
      const nextIds = new Set(genreEntities.map((g) => g.id));
      let changed =
        currentIds.size !== nextIds.size ||
        [...nextIds].some((id) => !currentIds.has(id));

      if (changed) {
        movieEntity.genres = genreEntities;
        await this.movies.save(movieEntity);
      }
    }

    const total = await this.movies.count();
    this.logger.log(`Movies in DB: ${total}`);
  }
}
