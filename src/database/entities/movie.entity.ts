import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Watchlist } from './watchlist.entity';
import { Genre } from './genre.entity';
import { Rating } from './rating.entity';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  tmdb_id: number;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  overview: string;

  @Column('date')
  release_date: Date;

  @Column({ length: 255, nullable: true })
  poster_path: string;

  @Column('float', { default: 0 })
  avg_rating: number;

  @OneToMany(() => Rating, (rating) => rating.movie)
  ratings: Rating[];

  @OneToMany(() => Watchlist, (watchlist) => watchlist.movie)
  watchlist: Watchlist[];

  @ManyToMany(() => Genre, (genre) => genre.movies)
  @JoinTable({
    name: 'movie_genre',
    joinColumn: { name: 'movie_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'genre_id', referencedColumnName: 'id' },
  })
  genres: Genre[];
}
