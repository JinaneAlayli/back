import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const plan = this.repo.create(data);
    return this.repo.save(plan);
  }

  async update(id: number, data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const plan = await this.repo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    Object.assign(plan, data);
    return this.repo.save(plan);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
