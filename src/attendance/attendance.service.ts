 import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './attendance.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
  ) {}

  findAll(): Promise<Attendance[]> {
    return this.attendanceRepo.find({ relations: ['user'] });
  }

  findByUser(userId: number): Promise<Attendance[]> {
    return this.attendanceRepo.find({ where: { user_id: userId } });
  }

  async submitAttendance(userId: number, date: string, type: 'check_in' | 'check_out'): Promise<Attendance> {
    let record = await this.attendanceRepo.findOne({ where: { user_id: userId, date } });

    const currentTime = new Date().toTimeString().split(' ')[0]; // e.g. 14:05:00

    if (!record) {
      record = this.attendanceRepo.create({ user_id: userId, date });
    }

    if (type === 'check_in') record.check_in = currentTime;
    if (type === 'check_out') record.check_out = currentTime;

    return this.attendanceRepo.save(record);
  }

  async update(id: number, data: Partial<Attendance>): Promise<Attendance> {
    await this.attendanceRepo.update(id, data);
    return this.attendanceRepo.findOneByOrFail({ id });
  }
  
}
