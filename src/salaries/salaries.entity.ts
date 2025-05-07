import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    JoinColumn,
  } from 'typeorm'
  import { User } from '../users/user.entity'
  
  @Entity('salaries')
  export class Salary {
    @PrimaryGeneratedColumn()
    id: number
  
    @Column()
    user_id: number
  
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User
  
    @Column('numeric')
    base_salary: number
  
    @Column('numeric', { default: 0 })
    bonus: number
  
    @Column('numeric', { default: 0 })
    deductions: number
  
    @Column('numeric', { default: 0 })
    overtime: number
  
    @Column()
    month: number
  
    @Column()
    year: number
  
    @Column({ type: 'date' })
    effective_from: string
  
    @Column({ default: 'pending' })
    status: string
  
    @Column({ nullable: true })
    file_url: string
   
    @Column({ default: false })
    payslip_requested: boolean;
  
    @CreateDateColumn()
    created_at: Date
  }
  