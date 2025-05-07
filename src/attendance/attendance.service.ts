import { Injectable, BadRequestException,NotFoundException,ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Attendance } from './attendance.entity'
import { User } from '../users/user.entity'
import { BusinessSettingsService } from '../business-settings/business-settings.service'

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly repo: Repository<Attendance>,

    private readonly businessSettingsService: BusinessSettingsService,
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
  async getAttendanceSummary(userId: number, month: number, year: number) {
    const records = await this.repo
      .createQueryBuilder('attendance')
      .where('attendance.user_id = :userId', { userId })
      .andWhere('EXTRACT(MONTH FROM attendance.date) = :month', { month })
      .andWhere('EXTRACT(YEAR FROM attendance.date) = :year', { year })
      .getMany()

    const totalWorked = records.reduce((sum, r) => sum + (r.worked_hours || 0), 0)

    // Fetch user's company settings
    const user = await this.repo.manager.findOneOrFail(User, {
      where: { id: userId },
      relations: ['company'],
    })

    const settings = await this.businessSettingsService.findByCompany(user.company_id)
    if (!settings) throw new NotFoundException('Business settings not found for the company')

    const start = parseTime(settings.workday_start)
    const end = parseTime(settings.workday_end)
    const expectedDailyHours = (end - start) / 60

    const workedDays = records.length
    const expectedHours = expectedDailyHours * workedDays

    return {
      totalWorkedHours: Number(totalWorked.toFixed(2)),
      expectedHours: Number(expectedHours.toFixed(2)),
      workedDays,
      workday_start: settings.workday_start,
      workday_end: settings.workday_end,
    }
  }
  async updateAttendance(id: number, data: Partial<Attendance>, user: User) {
    if (![2, 3].includes(user.role_id)) {
      throw new ForbiddenException("Only Owner or HR can update attendance");
    }
  
    const record = await this.repo.findOneBy({ id });
    if (!record) throw new NotFoundException("Attendance not found");
  
    Object.assign(record, {
      check_in: data.check_in || record.check_in,
      check_out: data.check_out || record.check_out,
      worked_hours: data.worked_hours ?? record.worked_hours,
      status: data.status || record.status,
      date: data.date || record.date,
    });
  
    return this.repo.save(record);
  }
  
}

// Helper to convert HH:MM to minutes
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}
  
 
