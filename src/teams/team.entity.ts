import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
  } from 'typeorm';
  import { User } from '../users/user.entity';
  import { Company } from '../companies/company.entity';
  
  @Entity('teams')
  export class Team {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    company_id: number;
  
    @Column()
    name: string;
  
    @Column({ nullable: true })
    description: string;
    
    @Column({ nullable: true })
    department: string
    
    @Column({ nullable: true })
    leader_id: number;
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
   
    @ManyToOne(() => User, user => user.led_teams, { eager: true })
    @JoinColumn({ name: 'leader_id' })
    leader: User;
  
    @ManyToOne(() => Company, company => company.teams)
    @JoinColumn({ name: 'company_id' })
    company: Company;
  }
  