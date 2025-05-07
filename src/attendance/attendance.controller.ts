import { Controller, Get, Post,Patch, Req, UseGuards, Body ,Param,Query} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
 import { PermissionsGuard } from '../common/guards/permissions.guard';

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
  @Get('summary/:userId')
  getSummary(
    @Param('userId') userId: number,
    @Query('month') month: string,
    @Query('year') year: string
  ) {
    return this.service.getAttendanceSummary(+userId, +month, +year);
  }
  @Patch(':id')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('attendance', 'update') // 👈 Only Owner & HR should have this in DB
updateAttendance(@Param('id') id: number, @Body() body: any, @Req() req: any) {
  return this.service.updateAttendance(+id, body, req.user);
}


}