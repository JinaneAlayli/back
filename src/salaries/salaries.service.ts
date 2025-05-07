import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Salary } from './salaries.entity'
import { BadRequestException,ForbiddenException } from '@nestjs/common';
import { User } from '../users/user.entity'
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

  async create(data: Partial<Salary>, user: User): Promise<Salary> {
    // Prevent duplicate salary for same user, month, year
    const existing = await this.repo.findOne({
      where: {
        user_id: data.user_id,
        month: data.month,
        year: data.year,
      },
    });
  
    if (existing) {
      throw new BadRequestException("Salary for this month already exists");
    }
  
    // Validate effective_from date
    const effectiveDate = new Date(data.effective_from || "");
    const now = new Date();
  
    if (isNaN(effectiveDate.getTime())) {
      throw new BadRequestException("Invalid effective_from date format");
    }
  
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);
  
    // Strict validation for employee/leader (role_id > 3)
    if (user.role_id > 3) {
      if (effectiveDate > now) {
        throw new BadRequestException("Effective date cannot be in the future");
      }
      if (effectiveDate < oneYearAgo) {
        throw new BadRequestException("Effective date is too old");
      }
    }
  
    const salary = this.repo.create(data);
    return this.repo.save(salary);
  }
  

  async update(id: number, data: Partial<Salary>, user: User): Promise<Salary> {
    if (data.effective_from && isNaN(Date.parse(data.effective_from))) {
      throw new BadRequestException('Invalid effective_from date format');
    }
  
    const effectiveDate = new Date(data.effective_from || "");
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);
  
    if (user.role_id > 3) {
      if (effectiveDate > now) {
        throw new BadRequestException("Effective date cannot be in the future");
      }
      if (effectiveDate < oneYearAgo) {
        throw new BadRequestException("Effective date is too old");
      }
    }
  
    const updatedData: Partial<Salary> = {
      user_id: Number(data.user_id),
      base_salary: Number(data.base_salary),
      bonus: Number(data.bonus || 0),
      overtime: Number(data.overtime || 0),
      deductions: Number(data.deductions || 0),
      month: Number(data.month),
      year: Number(data.year),
      effective_from: data.effective_from,
      status: data.status || 'pending',
    };
  
    await this.repo.update(id, updatedData);
    return this.findOne(id);
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

    const fileUrl = await this.uploadService.uploadPayslipFile(file, salary.user_id)
    salary.file_url = fileUrl;
    salary.payslip_requested = false;
    return this.repo.save(salary);
  }
  async downloadPayslip(salaryId: number, user: User) {
    const salary = await this.repo.findOne({
      where: { id: salaryId },
      relations: ['user'],
    });

    if (!salary || !salary.file_url) {
      throw new NotFoundException('Payslip not found');
    }
 
    if (
      user.role_id > 3 && // Leader or Employee
      salary.user_id !== user.id // trying to access another user’s file
    ) {
      throw new ForbiddenException('You can only download your own payslip');
    }

    return {
      url: salary.file_url,
    };
  }
}
