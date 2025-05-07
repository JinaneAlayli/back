import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common'
import { AnnouncementsService } from './announcements.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { PermissionsGuard } from '../common/guards/permissions.guard'
import { Permissions } from '../common/decorators/permissions.decorator'

@Controller('announcements')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AnnouncementsController {
  constructor(private readonly service: AnnouncementsService) {}

  @Post()
  @Permissions('announcements', 'manage')
  create(@Body() body: any, @Req() req: any) {
    return this.service.create(body, req.user)
  }

  @Get()
  @Permissions('announcements', 'view')
  findAll(@Req() req: any) {
    return this.service.findAll(req.user)
  }

  @Patch(':id')
  @Permissions('announcements', 'manage')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Req() req: any) {
    return this.service.update(id, body, req.user)
  }

  @Delete(':id')
  @Permissions('announcements', 'manage')
  delete(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.service.delete(id, req.user)
  }
}
