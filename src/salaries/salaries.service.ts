import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Salary } from './salaries.entity'

import { UploadService } from '../common/upload/upload.service';
import type { MultipartFile } from '@fastify/multipart';

@Injectable()
export class SalariesService {
  constructor(
    @InjectRepository(Salary)
    private readonly repo: Repository<Salary>,
    private readonly uploadService: UploadService,
  ) {}
  findAll(): Promise<Salary[]> {
    return this.repo.find({ relations: ['user'] })
  }

  findByUser(userId: number): Promise<Salary[]> {
    return this.repo.find({
      where: { user_id: userId },
      order: { year: 'DESC', month: 'DESC' },
    })
  }

  // Get all salaries for active (non-deleted) users in the same company
  findActiveSalariesByCompany(company_id: number): Promise<Salary[]> {
    return this.repo.find({
      where: {
        user: {
          company_id,
          is_deleted: false,
        },
      },
      relations: ['user'],
      order: { year: 'DESC', month: 'DESC' },
    })
  }

  findOne(id: number): Promise<Salary> {
    return this.repo.findOneOrFail({ where: { id }, relations: ['user'] })
  }

  create(data: Partial<Salary>): Promise<Salary> {
    const salary = this.repo.create(data)
    return this.repo.save(salary)
  }

  async update(id: number, data: Partial<Salary>): Promise<Salary> {
    await this.repo.update(id, data)
    return this.findOne(id)
  }

  delete(id: number): Promise<any> {
    return this.repo.delete(id)
  }

  async requestPayslip(requester: any, targetUserId: number) {
    const today = new Date();
    const CURRENT_MONTH = today.getMonth() + 1;
    const CURRENT_YEAR = today.getFullYear();

    const salary = await this.repo.findOne({
      where: { user_id: targetUserId, month: CURRENT_MONTH, year: CURRENT_YEAR },
    });

    if (!salary) {
      throw new NotFoundException('Salary record not found');
    }

    salary.payslip_requested = true;
    return this.repo.save(salary);
  }
  async uploadPayslip(salaryId: number, file: MultipartFile): Promise<Salary> {
    const salary = await this.repo.findOne({ where: { id: salaryId } });
    if (!salary) {
      throw new NotFoundException('Salary record not found');
    }

    const fileUrl = await this.uploadService.uploadProfileImage(file, salary.user_id);
    salary.file_url = fileUrl;
    salary.payslip_requested = false;
    return this.repo.save(salary);
  }
}
