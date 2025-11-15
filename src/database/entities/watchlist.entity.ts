import { Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from './user.entity';
import { Movie } from './movie.entity';

@Entity('watchlists')
// A user can only have a movie once in their watchlist
@Unique(['user', 'movie'])
export class Watchlist {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.watchlist)
  user: User;

  @ManyToOne(() => Movie, (movie) => movie.watchlist)
  movie: Movie;
}
