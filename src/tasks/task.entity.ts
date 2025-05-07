import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  created_by: number;

  @Column('text')
  task: string;

  @Column('text', { nullable: true })
  note: string;

  @Column({ default: false })
  completed: boolean;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'date', nullable: true })
  due_date: string;
 
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
 
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
