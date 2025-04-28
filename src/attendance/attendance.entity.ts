// 📁 src/attendance/attendance.entity.ts
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
  
    @ManyToOne(() => User, user => user.attendanceRecords)
    @JoinColumn({ name: 'user_id' })
    user: User;
  }
  