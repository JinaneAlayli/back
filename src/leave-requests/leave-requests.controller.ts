import { Controller, Get, Post, Patch, Param, Body, Req, ParseIntPipe, UseGuards } from '@nestjs/common'
import { LeaveRequestsService } from './leave-requests.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('leave-requests')
@UseGuards(JwtAuthGuard)
export class LeaveRequestsController {
  constructor(private readonly service: LeaveRequestsService) {}

  @Post()
  create(@Body() body: any, @Req() req: any) {
    const role = req.user.role_id
    if ([2, 3].includes(role)) {
      return this.service.createByManager(body, req.user.id)
    } else {
      return this.service.create(body, req.user)
    }
  }

  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(req.user)
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
    @Req() req: any
  ) {
    return this.service.updateStatus(id, status, req.user.id)
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.service.cancel(id, req.user.id)
  }
}