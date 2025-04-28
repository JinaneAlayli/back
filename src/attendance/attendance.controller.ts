 import {
    Controller,
    Get,
    Patch,
    Post,
    Body,
    Param,
    Req,
    UseGuards,
  } from '@nestjs/common';
  import { AttendanceService } from './attendance.service';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { PermissionsGuard } from '../common/guards/permissions.guard';
  import { Permissions } from '../common/decorators/permissions.decorator';
  
  @Controller('attendance')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  export class AttendanceController {
    constructor(private readonly service: AttendanceService) {}
  
    @Get()
    @Permissions('attendance', 'view')
    findAll() {
      return this.service.findAll();
    }
  
    @Get('me')
    @Permissions('attendance', 'view')
    findMyRecords(@Req() req) {
      return this.service.findByUser(req.user.id);
    }
  
    @Post('submit')
    @Permissions('attendance', 'submit')
    submit(@Req() req, @Body() body: { type: 'check_in' | 'check_out' }) {
      const today = new Date().toISOString().split('T')[0];
      return this.service.submitAttendance(req.user.id, today, body.type);
    }
  
    @Patch(':id')
    @Permissions('attendance', 'update')
    update(@Param('id') id: number, @Body() body: any) {
      return this.service.update(+id, body);
    }
  }
  