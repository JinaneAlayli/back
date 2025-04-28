import { Injectable, BadRequestException } from '@nestjs/common';
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

      const company = this.companyRepo.create({
        name: dto.company_name,
        employee_nb: dto.employee_nb,
        subscription_plan_id: dto.subscription_plan_id,
        billing_cycle: dto.billing_cycle,
        company_code: code,
        status: "active",
        owner_id: savedOwner.id,
        started_at: new Date(),
      });

      const savedCompany = await this.companyRepo.save(company);

      await this.userRepo.update(savedOwner.id, {
        company_id: savedCompany.id,
      });

      const selectedPlan = await this.subscriptionRepo.findOne({ where: { id: dto.subscription_plan_id } });

      if (!selectedPlan) throw new BadRequestException("Invalid subscription plan");

      if (selectedPlan.price !== 0) {
        const totalAmount = parseFloat(String(selectedPlan.price)) * (
          dto.billing_cycle === 'yearly'
            ? 12 * (1 - parseFloat(String(selectedPlan.discount_percent || '0')) / 100)
            : 1
        )
        
      
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
}