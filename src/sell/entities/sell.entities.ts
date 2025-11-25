import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entities';

@Entity('sells')
export class Sell {
  @PrimaryGeneratedColumn('uuid')
  id: string; // sell UUID

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column({ type: 'uuid' })
  cartUuid: string;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @CreateDateColumn()
  createdAt: Date;
}
