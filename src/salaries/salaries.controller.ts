// salaries.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { SalariesService } from './salaries.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { FastifyRequest } from 'fastify';
import { User } from '../users/user.entity';

@Controller('salaries')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SalariesController {
  constructor(private readonly service: SalariesService) {}

  @Get('active/company')
  @Permissions('salaries', 'view')
  async getActiveSalariesForCompany(@Req() req: FastifyRequest) {
    const user = req.user as any;
    if (!user?.company_id) {
      throw new BadRequestException('User not authenticated or missing company_id');
    }
    return this.service.findActiveSalariesByCompany(user.company_id);
  }

  @Get('user/:userId')
  @Permissions('salaries', 'view')
  getByUser(@Param('userId') userId: number) {
    return this.service.findByUser(+userId);
  }

  @Get(':id')
  @Permissions('salaries', 'view')
  getOne(@Param('id') id: number) {
    return this.service.findOne(+id);
  }

  @Post()
  @Permissions('salaries', 'create')
  async create(@Body() body: any, @Req() req: FastifyRequest) {
    const user = req.user as User;
    return this.service.create(body, user);
  }

  @Patch(':id')
  @Permissions('salaries', 'update')
  update(@Param('id') id: number, @Body() body: any, @Req() req: FastifyRequest) {
    const user = req.user as User;
    return this.service.update(+id, body, user);
  }

  @Delete(':id')
  @Permissions('salaries', 'delete')
  remove(@Param('id') id: number) {
    return this.service.delete(+id);
  }

  @Get('me')
  @Permissions('salaries', 'view_own')
  getMySalaries(@Req() req: FastifyRequest) {
    const user = req.user as any;
    return this.service.findByUser(user.id);
  }

  @Post('request-payslip/:userId')
  @Permissions('salaries', 'request_payslip')
  requestPayslip(@Req() req: FastifyRequest, @Param('userId') userId: number) {
    const currentUser = req.user as any;
    return this.service.requestPayslip(currentUser, userId);
  }

  @Post(':id/upload-payslip')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('salaries', 'upload_payslip')
  async uploadPayslip(@Param('id') id: number, @Req() req: FastifyRequest) {
    const parts = req.parts();
    let file: any = null;

    for await (const part of parts) {
      if (part.type === 'file') {
        file = part;
        break;
      }
    }

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.service.uploadPayslip(+id, file);
  }

  @Get(':id/download-payslip')
  @Permissions('salaries', 'download_payslip')
  async downloadPayslip(@Param('id') id: number, @Req() req: FastifyRequest) {
    if (!req.user) {
      throw new BadRequestException('User not authenticated');
    }
    return this.service.downloadPayslip(+id, req.user as User);
  }
}
