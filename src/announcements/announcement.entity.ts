import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { User } from '../users/user.entity'

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  company_id: number

  @Column({ nullable: true })
  team_id: number

  @Column()
  created_by: number

  @Column()
  title: string

  @Column('text')
  content: string

  @CreateDateColumn()
  created_at: Date

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'created_by' })
  creator: User
}
