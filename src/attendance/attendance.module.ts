import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './attendance.entity';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { PermissionsModule } from '../permissions/permissions.module';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, User]), PermissionsModule],
  providers: [AttendanceService],
  controllers: [AttendanceController],
})
export class AttendanceModule {}