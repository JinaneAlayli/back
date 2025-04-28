import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from './subscription-plan.entity';

@Injectable()
export class SubscriptionPlansService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly repo: Repository<SubscriptionPlan>
  ) {}

  findAll(): Promise<SubscriptionPlan[]> {
    return this.repo.find({ where: { is_active: true } });
  }

  async findById(id: number): Promise<SubscriptionPlan> {
    const plan = await this.repo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }
  

  async create(data: Partial<SubscriptionPlan>, role_id: number): Promise<SubscriptionPlan> {
    if (role_id !== 1) throw new ForbiddenException('Only platform owner can create plans');
    const plan = this.repo.create(data);
    return this.repo.save(plan);
  }

  async update(id: number, data: Partial<SubscriptionPlan>, role_id: number): Promise<SubscriptionPlan> {
    if (role_id !== 1) throw new ForbiddenException('Only platform owner can update plans');
    const plan = await this.repo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    Object.assign(plan, data);
    return this.repo.save(plan);
  }

  async delete(id: number, role_id: number): Promise<void> {
    if (role_id !== 1) throw new ForbiddenException('Only platform owner can delete plans');
    await this.repo.delete(id);
  }
}