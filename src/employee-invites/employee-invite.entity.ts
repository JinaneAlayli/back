import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../companies/company.entity';
import { Role } from '../roles/role.entity';
 
@Entity('employee_invites')
export class EmployeeInvite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  company_id: number;
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  email: string;

  @Column({ unique: true })
  token: string;

  @Column()
  role_id: number;
  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ nullable: true })
  team_id: number;
  

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ default: false })
  accepted: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}