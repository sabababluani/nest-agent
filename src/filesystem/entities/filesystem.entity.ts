import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum Action {
  READ = 'read',
  WRITE = 'write',
  CREATE = 'create',
}

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
