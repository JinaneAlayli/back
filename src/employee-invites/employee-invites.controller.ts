import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EmployeeInvitesService } from './employee-invites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { FastifyRequest } from 'fastify';
import { EmployeeInvite } from './employee-invite.entity';

@Controller('employee-invites')
export class EmployeeInvitesController {
  constructor(private readonly service: EmployeeInvitesService) {}

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('invites', 'create')
  @Post()
  async inviteEmployee(
    @Req() req: FastifyRequest,
    @Body() body: Partial<EmployeeInvite> & { name: string },
  ): Promise<{ invite: EmployeeInvite; link: string }> {
    const user = req.user as any;
    return this.service.create({ ...body, company_id: user.company_id });
  }

  @Get(':token')
  async getInviteByToken(@Param('token') token: string): Promise<EmployeeInvite | null> {
    return this.service.findByToken(token);
  }

  @Get()
  async getAll(): Promise<EmployeeInvite[]> {
    return this.service.findAll();
  }
}
