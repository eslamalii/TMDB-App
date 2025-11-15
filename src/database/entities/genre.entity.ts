import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Movie } from './movie.entity';

@Entity('genres')
export class Genre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  tmdb_id: number;

  @Column({ length: 100 })
  name: string;

  @ManyToMany(() => Movie, (movie) => movie.genres)
  movies: Movie[];
}
