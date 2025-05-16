import { Injectable, BadRequestException,ForbiddenException,NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { User } from '../users/user.entity';
import { SubscriptionPlan } from '../subscription-plans/subscription-plan.entity';
import { Payment } from '../payments/payment.entity';
import * as bcrypt from 'bcrypt';
import { RegisterCompanyDto } from './dto/register-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(SubscriptionPlan)
    private readonly subscriptionRepo: Repository<SubscriptionPlan>,

    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  findAll(): Promise<Company[]> {
    return this.companyRepo.find();
  }

  create(data: Partial<Company>): Promise<Company> {
    const company = this.companyRepo.create({
      ...data,
      company_code: this.generateCompanyCode(),
    });
    return this.companyRepo.save(company);
  }

async registerCompanyWithOwner(dto: RegisterCompanyDto) {
  try {
    const companyExists = await this.companyRepo.findOne({
      where: { name: dto.company_name },
    });
    if (companyExists) throw new BadRequestException("Company already exists");

    const userExists = await this.userRepo.findOne({
      where: { email: dto.owner.email },
    });
    if (userExists) throw new BadRequestException("User already exists");

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.owner.password, salt);

    const owner = this.userRepo.create({
      name: dto.owner.name,
      email: dto.owner.email,
      password: hashedPassword,
      phone: dto.owner.phone,
      role_id: 2,
    });
    const savedOwner = await this.userRepo.save(owner);

    const code = this.generateCompanyCode();

    const now = new Date();
    let ends_at: Date;

    if (dto.billing_cycle === 'yearly') {
      ends_at = new Date(now.setFullYear(now.getFullYear() + 1));
    } else {
      ends_at = new Date(now.setMonth(now.getMonth() + 1));
    }

    const company = this.companyRepo.create({
      name: dto.company_name,
      employee_nb: dto.employee_nb,
      subscription_plan_id: dto.subscription_plan_id,
      billing_cycle: dto.billing_cycle,
      company_code: code,
      status: "active",
      owner_id: savedOwner.id,
      started_at: new Date(),
      ends_at, 
    });

    const savedCompany = await this.companyRepo.save(company);

    await this.userRepo.update(savedOwner.id, {
      company_id: savedCompany.id,
    });

    const selectedPlan = await this.subscriptionRepo.findOne({
      where: { id: dto.subscription_plan_id },
    });

    if (!selectedPlan) throw new BadRequestException("Invalid subscription plan");

    if (selectedPlan.price !== 0) {
      const totalAmount = parseFloat(String(selectedPlan.price)) * (
        dto.billing_cycle === 'yearly'
          ? 12 * (1 - parseFloat(String(selectedPlan.discount_percent || '0')) / 100)
          : 1
      );

      const payment = this.paymentRepo.create({
        company_id: savedCompany.id,
        amount: totalAmount,
        payment_provider: 'manual',
        payment_status: 'completed',
        transaction_id: `TRX-${Date.now()}`,
        checkout_session_id: `CS-${Date.now()}`,
      });

      await this.paymentRepo.save(payment);
    }

    return {
      message: "Company and owner registered successfully",
      redirect_to: "/business-settings",
    };
  } catch (error) {
    throw new BadRequestException(error.message || "Something went wrong");
  }
}


  generateCompanyCode() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const randLetters = Array(2)
      .fill("")
      .map(() => letters[Math.floor(Math.random() * letters.length)])
      .join("");
    const randNumbers = Math.floor(1000 + Math.random() * 9000);
    return `BTEAM-${randLetters}${randNumbers}`;
  }

  async renewSubscription(user: User) {
    if (user.role_id !== 2) throw new ForbiddenException("Only company owners can renew");
  
    const company = await this.companyRepo.findOne({
      where: { owner_id: user.id },
      relations: ['subscription_plan'],
    });
  
    if (!company) throw new BadRequestException("Company not found");
  
    const now = new Date();
    const endsAt = new Date(company.ends_at);
    const plan = company.subscription_plan;
  
    if (!plan) throw new BadRequestException("Subscription plan not found");
  
    const diffDays = Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
    if (diffDays > 3) {
      throw new BadRequestException("Too early to renew. You can renew only 3 days before expiry or after.");
    }
  
    const monthsToAdd = company.billing_cycle === 'yearly' ? 12 : 1;
  
    const newEndsAt = new Date(endsAt > now ? endsAt : now);
    newEndsAt.setMonth(newEndsAt.getMonth() + monthsToAdd);
  
    const cycleMultiplier = company.billing_cycle === 'yearly'
      ? 12 * (1 - (Number(plan.discount_percent) / 100))
      : 1;
  
    const amount = Number(plan.price) * cycleMultiplier;
  
    const payment = this.paymentRepo.create({
      company_id: company.id,
      amount,
      payment_provider: 'manual',
      payment_status: 'completed',
      transaction_id: `RENEW-${Date.now()}`,
      checkout_session_id: `RENEW-${Date.now()}`,
    });
    await this.paymentRepo.save(payment);
  
    company.ends_at = newEndsAt;
    await this.companyRepo.save(company);
  
    return {
      message: "Renewal successful",
      new_ends_at: newEndsAt,
    };
  }
  async findCompanyByOwnerId(ownerId: number) {
    const company = await this.companyRepo.findOne({
      where: { owner_id: ownerId },
      relations: ['subscription_plan'],
    });
  
    if (!company) throw new NotFoundException('Company not found');
  
    return company;
  }
  
  async getAllWithOwnersAndPlans(): Promise<Company[]> {
    return this.companyRepo.find({
      relations: ['owner', 'subscription_plan'],
      order: { created_at: 'DESC' },
    });
  }
  async updateCompany(id: number, data: Partial<Company>) {
    const company = await this.companyRepo.findOne({ where: { id } });
    if (!company) throw new NotFoundException("Company not found");
  
    Object.assign(company, data);
    return this.companyRepo.save(company);
  }
  
  async hardDeleteCompany(id: number) {
    const company = await this.companyRepo.findOne({ where: { id } });
    if (!company) throw new NotFoundException("Company not found");
  
    await this.companyRepo.remove(company); // This triggers cascading delete
    return { message: "Company and all related data deleted" };
  }
  
  
}