import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { Role } from './role.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Req } from '@nestjs/common'
import type { FastifyRequest } from 'fastify'

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('roles', 'view')
async getAll(@Req() req: FastifyRequest) {
  const user = req.user as any;

  if (user.role_id === 1) { // SuperAdmin
    return this.rolesService.findAll();
  }

  if (user.role_id === 2) { // CompanyOwner
    const allowedRoles = [3, 4, 5]; // HR Manager, Team Leader, Employee
    return this.rolesService.findByIds(allowedRoles);
  }

  if (user.role_id === 3) { // HR Manager
    const allowedRoles = [4, 5]; // Team Leader, Employee
    return this.rolesService.findByIds(allowedRoles);
  }

  // Other users (Team Leader, Employee) --> No access to roles
  return [];
}


  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('roles', 'create')
  create(@Body() body: { name: string }): Promise<Role> {
    return this.rolesService.create(body);
  }
}