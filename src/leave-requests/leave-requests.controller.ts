 
import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  ParseIntPipe,
  UseGuards,
  Delete,
} from '@nestjs/common'
import { LeaveRequestsService } from './leave-requests.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { PermissionsGuard } from '../common/guards/permissions.guard'
import { Permissions } from '../common/decorators/permissions.decorator'

@Controller('leave-requests')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LeaveRequestsController {
  constructor(private readonly service: LeaveRequestsService) {}

  @Post()
  @Permissions('leave_requests', 'create')
  create(@Body() body: any, @Req() req: any) {
    const role = req.user.role_id
    if ([2, 3].includes(role)) {
      return this.service.createByManager(body, req.user.id)
    } else {
      return this.service.create(body, req.user)
    }
  }

  @Get()
@Permissions('leave_requests', 'view_all')  
  findAll(@Req() req: any) {
    return this.service.findAll(req.user)
  }
  @Get('me')
@Permissions('leave_requests', 'view_own')
findAllOwn(@Req() req: any) {
  return this.service.findAll(req.user)
}
@Get('all')
@Permissions('leave_requests', 'view_all')
findAllForManagers(@Req() req: any) {
  return this.service.findAll(req.user)
}


  @Patch(':id/status')
  @Permissions('leave_requests', 'approve')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
    @Req() req: any
  ) {
    return this.service.updateStatus(id, status, req.user.id)
  }

  @Patch(':id/cancel')
  @Permissions('leave_requests', 'cancel')
  cancel(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.service.cancel(id, req.user.id)
  }

  @Delete(':id')
  @Permissions('leave_requests', 'delete')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id)
  }
  @Patch(':id')
@Permissions('leave_requests', 'create')  
update(
  @Param('id', ParseIntPipe) id: number,
  @Body() body: any,
  @Req() req: any
) {
  return this.service.update(id, body, req.user)
}

}
