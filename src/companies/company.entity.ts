import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany,JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Team } from 'src/teams/team.entity';
import { SubscriptionPlan } from '../subscription-plans/subscription-plan.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
  
  @Column({ default: false })
  renew_requested: boolean;

  @Column()
  owner_id: number;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ unique: true })
  company_code: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  employee_nb: number;

  @Column({ nullable: true })
  subscription_plan_id: number;
 @ManyToOne(() => SubscriptionPlan)
@JoinColumn({ name: 'subscription_plan_id' })
subscription_plan: SubscriptionPlan;


  @Column({ type: 'timestamp', nullable: true })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  ends_at: Date;

   
  @Column({ nullable: true })
  billing_cycle: string;
  
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
  @OneToMany(() => Team, team => team.company)
teams: Team[];

}