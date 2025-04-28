import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Salary } from './salaries.entity'

@Injectable()
export class SalariesService {
  constructor(
    @InjectRepository(Salary)
    private readonly repo: Repository<Salary>,
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
}
