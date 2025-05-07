import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './attendance.entity';
import { User } from '../users/user.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly repo: Repository<Attendance>,
  ) {}

  async checkIn(user: User, data: any, ip: string) {
    const today = new Date().toISOString().split('T')[0];

    const existing = await this.repo.findOne({ where: { user_id: user.id, date: today } });
    if (existing?.check_in) throw new BadRequestException('Already checked in');

    const attendance = this.repo.create({
      user_id: user.id,
      date: today,
      check_in: new Date().toTimeString().split(' ')[0],
      location_lat: data.location_lat,
      location_lng: data.location_lng,
      ip_address: ip,
      status: 'present',
    });
    return this.repo.save(attendance);
  }

  async checkOut(user: User) {
    const today = new Date().toISOString().split('T')[0];
    const record = await this.repo.findOne({ where: { user_id: user.id, date: today } });

    if (!record || record.check_out) throw new BadRequestException('No check-in or already checked out');

    const now = new Date();
    const checkInTime = new Date(`${record.date}T${record.check_in}`);
    const worked = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    record.check_out = now.toTimeString().split(' ')[0];
    record.worked_hours = parseFloat(worked.toFixed(2));

    return this.repo.save(record);
  }

  async getAll(user: User) {
    if ([2, 3].includes(user.role_id)) return this.repo.find({ relations: ['user'], order: { date: 'DESC' } });
    if (user.role_id === 4) return this.repo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.user', 'user')
      .where('user.team_id = :teamId', { teamId: user.team_id })
      .orderBy('attendance.date', 'DESC')
      .getMany();

    return this.repo.find({ where: { user_id: user.id }, order: { date: 'DESC' } });
  }
}
