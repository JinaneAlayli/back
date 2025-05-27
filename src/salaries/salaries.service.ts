// salaries.service.ts
import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Salary } from './salaries.entity';
import { User } from '../users/user.entity';
import { UploadService } from '../common/upload/upload.service';


@Injectable()
export class SalariesService {
  constructor(
    @InjectRepository(Salary)
    private salaryRepo: Repository<Salary>,
     private readonly uploadService: UploadService,
  ) {}

  async findActiveSalariesByCompany(company_id: number) {
    return this.salaryRepo
      .createQueryBuilder('salary')
      .leftJoinAndSelect('salary.user', 'user')
      .where('user.company_id = :company_id', { company_id })
      .getMany();
  }

  async findByUser(userId: number) {
    return this.salaryRepo.find({ where: { user_id: userId }, order: { year: 'DESC', month: 'DESC' } });
  }

  async findOne(id: number) {
    const salary = await this.salaryRepo.findOne({ where: { id }, relations: ['user'] });
    if (!salary) throw new NotFoundException('Salary not found');
    return salary;
  }

  async create(body: any, user: User) {
    if (![2, 3].includes(user.role_id)) {
      throw new ForbiddenException('You are not allowed to create salaries');
    }
    const salary = this.salaryRepo.create(body);
    return this.salaryRepo.save(salary);
  }

  async update(id: number, body: any, user: User) {
    const salary = await this.salaryRepo.findOne({ where: { id }, relations: ['user'] });
    if (!salary) throw new NotFoundException('Salary record not found');

    const canEdit = [2, 3].includes(user.role_id);
    if (!canEdit) throw new ForbiddenException('Not allowed to update salary');

    if (body.file_url === null) {
      salary.file_url = '';
      salary.payslip_requested = false;
    } else {
      Object.assign(salary, body);
    }

    return this.salaryRepo.save(salary);
  }

  async delete(id: number) {
    const salary = await this.salaryRepo.findOneBy({ id });
    if (!salary) throw new NotFoundException('Salary not found');
    return this.salaryRepo.remove(salary);
  }

  async requestPayslip(currentUser: any, targetUserId: number) {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const salary = await this.salaryRepo.findOne({ where: { user_id: targetUserId, month, year } });
    if (!salary) throw new NotFoundException('Salary not found for this month');

    if (salary.file_url) {
      throw new ForbiddenException('Payslip already uploaded');
    }

    const canRequest = [2, 3, 4, 5].includes(currentUser.role_id) ;
    if (!canRequest) {
      throw new ForbiddenException('You are not allowed to request payslip for this user');
    }

    salary.payslip_requested = true;
    return this.salaryRepo.save(salary);
  }

  async uploadPayslip(id: number, file: any) {
    if (!file?.filename) throw new BadRequestException('No file uploaded');

    const salary = await this.salaryRepo.findOne({ where: { id }, relations: ['user'] });
    if (!salary) throw new NotFoundException('Salary not found');
const fileUrl = await this.uploadService.uploadPayslipFile(file, salary.user_id)
    salary.file_url = fileUrl;
    salary.payslip_requested = false;
    return this.salaryRepo.save(salary);
  }

  async downloadPayslip(id: number, user: User) {
    const salary = await this.salaryRepo.findOne({ where: { id }, relations: ['user'] });
    if (!salary || !salary.file_url) {
      throw new NotFoundException('Payslip not available');
    }

    const canDownload = [2, 3].includes(user.role_id) || salary.user.id === user.id;
    if (!canDownload) {
      throw new ForbiddenException('Not allowed to download this payslip');
    }

    return { file_url: salary.file_url };
  }
}
