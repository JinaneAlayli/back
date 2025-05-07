import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time', nullable: true })
  check_in: string;

  @Column({ type: 'time', nullable: true })
  check_out: string;

  @Column({ type: 'decimal', nullable: true })
  location_lat: number;

  @Column({ type: 'decimal', nullable: true })
  location_lng: number;

  @Column({ nullable: true })
  ip_address: string;

  @Column({ nullable: true })
  status: string; // present

  @Column({ type: 'decimal', nullable: true })
  worked_hours: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
