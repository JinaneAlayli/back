 import { Injectable,NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  async findAll(): Promise<Payment[]> {
    return this.paymentRepo.find();
  }

  async findByCompany(companyId: number): Promise<Payment[]> {
    return this.paymentRepo.find({ where: { company_id: companyId } });
  }

  async create(data: Partial<Payment>): Promise<Payment> {
    const payment = this.paymentRepo.create(data);
    return this.paymentRepo.save(payment);
  }

  async update(id: number, data: Partial<Payment>): Promise<Payment> {
    await this.paymentRepo.update(id, data);
    const updated = await this.paymentRepo.findOneBy({ id });
    if (!updated) throw new NotFoundException('Payment not found');  
    return updated;
  }
}