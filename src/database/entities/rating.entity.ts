import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Movie } from './movie.entity';

@Entity('ratings')
// A user can only rate a movie once
@Unique(['user', 'movie'])
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  score: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.ratings)
  user: User;

  @ManyToOne(() => Movie, (movie) => movie.ratings)
  movie: Movie;
}
