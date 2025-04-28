import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeInvite } from './employee-invite.entity';
import { User } from '../users/user.entity';
import { Company } from '../companies/company.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class EmployeeInvitesService {
  constructor(
    @InjectRepository(EmployeeInvite)
    private readonly repo: Repository<EmployeeInvite>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async create(
    data: Partial<EmployeeInvite> & { name: string },
  ): Promise<{ invite: EmployeeInvite; link: string }> {
    const token = randomUUID();
  
    //  Validation #1: Already registered?
    const existingUser = await this.userRepo.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new BadRequestException('This email is already registered in the system');
    }
  
    // Check for existing invite
    const existingInvite = await this.repo.findOne({ where: { email: data.email } });
  
    if (existingInvite) {
      const isExpired = existingInvite.expires_at < new Date();
  
      if (isExpired) {
        await this.repo.delete({ id: existingInvite.id });
      } else {
        throw new BadRequestException('This user has already been invited');
      }
    }
  
    //  Plan employee count check
    const employeeCount = await this.userRepo.count({
      where: { company_id: data.company_id },
    });
  
    const company = await this.companyRepo.findOne({
      where: { id: data.company_id },
      relations: ['subscription_plan'],
    });
  
    const maxEmployees = company?.subscription_plan?.features_json?.employee_limit ?? Infinity;
  
    if (employeeCount >= maxEmployees) {
      throw new BadRequestException('You’ve reached your employee limit for this plan');
    }
  
    //  Create fresh invite
    const invite = this.repo.create({
      ...data,
      token,
      expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });
  
    const savedInvite = await this.repo.save(invite);
    const link = `${process.env.FRONTEND_URL}/register?token=${token}`;
  
    return { invite: savedInvite, link };
  }
  

  async findByToken(token: string): Promise<EmployeeInvite | null> {
    return this.repo.findOne({ where: { token } });
  }

  async findAll(): Promise<EmployeeInvite[]> {
    return this.repo.find();
  }
}
