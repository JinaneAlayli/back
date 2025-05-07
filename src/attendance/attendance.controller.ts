import { Controller, Get, Post, Req, UseGuards, Body } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @Post('check-in')
  checkIn(@Req() req: any, @Body() body: any) {
    const ip = req.ip || req.connection?.remoteAddress || '';
    return this.service.checkIn(req.user, body, ip);
  }

  @Post('check-out')
  checkOut(@Req() req: any) {
    return this.service.checkOut(req.user);
  }

  @Get()
  getAll(@Req() req: any) {
    return this.service.getAll(req.user);
  }
}