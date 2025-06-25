import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('watchlist')
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  year: number;

  @Column()
  plot: string;
}
