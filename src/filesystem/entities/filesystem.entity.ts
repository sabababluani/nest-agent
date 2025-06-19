import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Filesystem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type : 'longtext' })
  prompt: string;

  @Column({ nullable: true })
  path: string;
}
