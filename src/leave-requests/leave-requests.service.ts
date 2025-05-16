import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { LeaveRequest } from './leave-request.entity'

@Injectable()
export class LeaveRequestsService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly leaveRepo: Repository<LeaveRequest>,
  ) {}

 async create(data: Partial<LeaveRequest>, user: any): Promise<LeaveRequest> {
  const existing = await this.leaveRepo.findOne({
    where: { user_id: user.id, status: 'pending' },
  })
  if (existing) throw new ForbiddenException('You already have a pending request.')

  const leave = this.leaveRepo.create({
    user_id: user.id,
    type: data.type,
    start_date: data.start_date,
    end_date: data.end_date,
    status: 'pending',
    reason: data.reason,
  })
  return await this.leaveRepo.save(leave)
}
async update(id: number, data: Partial<LeaveRequest>, user: any): Promise<LeaveRequest> {
  const leave = await this.leaveRepo.findOneBy({ id })

  if (!leave) throw new NotFoundException('Leave request not found')
  if (leave.user_id !== user.id) throw new ForbiddenException('Not your leave request')
  if (leave.status !== 'pending') throw new ForbiddenException('Cannot edit after status is changed')

  Object.assign(leave, {
    type: data.type ?? leave.type,
    start_date: data.start_date ?? leave.start_date,
    end_date: data.end_date ?? leave.end_date,
    reason: data.reason ?? leave.reason,
  })

  return this.leaveRepo.save(leave)
}


  async createByManager(data: Partial<LeaveRequest>, managerId: number): Promise<LeaveRequest> {
    const leave = this.leaveRepo.create({
      ...data,
      status: 'pending',
      manager_id: managerId,
    })
    return await this.leaveRepo.save(leave)
  }

async findAll(user: any): Promise<LeaveRequest[]> {
  const query = this.leaveRepo
    .createQueryBuilder('leave')
    .leftJoinAndSelect('leave.user', 'user')

  if (user.role_id === 2 || user.role_id === 3) {
    // Owner or HR: See all leave requests for same company
    return query
      .where('user.company_id = :companyId', { companyId: user.company_id })
      .getMany()
  }

  if (user.role_id === 4) {
    // Team Leader: See leave requests of users in their team
    return query
      .where('user.team_id = :teamId', { teamId: user.team_id })
      .getMany()
  }

  // Employee: See only their own leave requests
  return this.leaveRepo.find({
    where: { user_id: user.id },
    relations: ['user'],
  })
}

async delete(id: number): Promise<void> {
  const leave = await this.leaveRepo.findOneBy({ id })
  if (!leave) throw new NotFoundException('Leave request not found')
  await this.leaveRepo.delete(id)
}


  async updateStatus(id: number, status: string, managerId: number): Promise<LeaveRequest> {
    const leave = await this.leaveRepo.findOneBy({ id })
    if (!leave) throw new NotFoundException('Leave request not found')
    leave.status = status
    leave.manager_id = managerId
    return this.leaveRepo.save(leave)
  }

  async cancel(id: number, userId: number): Promise<LeaveRequest> {
    const leave = await this.leaveRepo.findOneBy({ id })
    if (!leave) throw new NotFoundException('Leave request not found')
    if (leave.user_id !== userId) throw new ForbiddenException('Not your leave request')
    leave.status = 'canceled'
    return this.leaveRepo.save(leave)
  }
}