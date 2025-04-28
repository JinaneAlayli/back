import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../companies/company.entity';

@Entity('business_settings')
export class BusinessSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  company_id: number;
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  salary_cycle: string;

  @Column({ type: 'time' })
  workday_start: string;

  @Column({ type: 'time' })
  workday_end: string;

  @Column()
  annual_leave_days: number;

  @Column()
  sick_leave_days: number;

  @Column('numeric')
  overtime_rate: number;

  @Column()
  currency: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
