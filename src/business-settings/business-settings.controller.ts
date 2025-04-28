import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { BusinessSettingsService } from './business-settings.service';
import { BusinessSetting } from './business-setting.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import type { FastifyRequest } from 'fastify';

@Controller('business-settings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BusinessSettingsController {
  constructor(private readonly service: BusinessSettingsService) {}

  @Get()
  @Permissions('business_settings', 'view')
  findAll(): Promise<BusinessSetting[]> {
    return this.service.findAll();
  }

  @Post()
  @Permissions('business_settings', 'create')
  async create(@Req() req: FastifyRequest, @Body() body: Partial<BusinessSetting>) {
    const user = req.user as any;
    const company_id = user.company_id;

    const existing = await this.service.findByCompany(company_id);
    if (existing) {
      throw new ConflictException('Settings already exist for this company');
    }

    return this.service.create({ ...body, company_id });
  }

  @Patch(':id')
  @Permissions('business_settings', 'update')
  async update(@Param('id') id: number, @Body() body: Partial<BusinessSetting>) {
    const existing = await this.service.findById(id);
    if (!existing) {
      throw new NotFoundException('Settings not found');
    }
    return this.service.update(id, body);
  }
  @Put('me')
@Permissions('business_settings', 'update')
async upsertMySettings(
  @Req() req: FastifyRequest,
  @Body() body: Partial<BusinessSetting>
): Promise<BusinessSetting> {
  try {
    const user = req.user as any;
 

    if (!user?.company_id) {
      throw new Error("User does not belong to a company");
    }

    const existing = await this.service.findByCompany(user.company_id);

    if (existing) { 
      return this.service.update(existing.id, {
        ...body,
        overtime_rate: body.overtime_rate ? Number(body.overtime_rate) : existing.overtime_rate,
        annual_leave_days: body.annual_leave_days ?? existing.annual_leave_days,
        sick_leave_days: body.sick_leave_days ?? existing.sick_leave_days,
      });
    } else { 
      return this.service.create({
        ...body,
        company_id: user.company_id,
        overtime_rate: body.overtime_rate ? Number(body.overtime_rate) : 1.5,
      });
    }
  } catch (err) { 
    throw err;
  }
}


}
