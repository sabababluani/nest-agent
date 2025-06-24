import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Action } from '../enums/action.enum';

@Entity()
export class Filesystem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'longtext' })
  prompt: string;

  @Column({ nullable: true })
  path: string;

  @Column({ type: 'enum', enum: Action })
  action: Action;
}
