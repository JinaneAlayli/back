import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
  } from 'typeorm'
  import { User } from '../users/user.entity'
  
  @Entity('leave_requests')
  export class LeaveRequest {
    @PrimaryGeneratedColumn()
    id: number
  
    @Column()
    user_id: number
  
    @Column({ nullable: true })
    manager_id: number
  
    @Column()
    type: string
  
    @Column({ type: 'date' })
    start_date: string
  
    @Column({ type: 'date' })
    end_date: string
  
    @Column()
    status: string // pending, approved, refused, canceled
  
    @Column('text')
    reason: string
  
    @CreateDateColumn()
    created_at: Date
  
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User
  
    @ManyToOne(() => User)
    @JoinColumn({ name: 'manager_id' })
    manager: User
  }
  