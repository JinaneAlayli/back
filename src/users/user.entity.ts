import { Entity, PrimaryGeneratedColumn, Column, ManyToOne,OneToMany, JoinColumn } from 'typeorm';
import { Company } from '../companies/company.entity';
import { Role } from '../roles/role.entity';
import { Team } from 'src/teams/team.entity';
import { Attendance } from 'src/attendance/attendance.entity';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: false })
  role_id: number;
  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ nullable: true })
  company_id: number;
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ nullable: true })
  team_id: number;
  @ManyToOne(() => Team)
@JoinColumn({ name: 'team_id' })
team: Team;

  @Column({ nullable: true })
  position: string
  
  @Column({ default: false })
  is_deleted: boolean;
  @Column({ nullable: true })
  phone: string;
  @Column({ nullable: true }) 
  profile_img: string;
  @OneToMany(() => Team, team => team.leader)
led_teams: Team[];
@OneToMany(() => Attendance, attendance => attendance.user)
attendanceRecords: Attendance[];


}
