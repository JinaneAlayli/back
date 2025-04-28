import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('numeric')
  price: number;

  @Column()
  billing_cycle: string; // e.g., "monthly", "yearly"

  @Column({ type: 'jsonb' })
  features_json: {
    employee_limit: number;
    teams_enabled?: boolean;
    payroll_enabled?: boolean;
    [key: string]: any;
  };

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'numeric', default: 0 })
discount_percent: number;  


  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;
}
