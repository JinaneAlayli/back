import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionPlansService } from './subscription-plans.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionPlan } from './subscription-plan.entity';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('subscription-plans')
export class SubscriptionPlansController {
  constructor(private readonly service: SubscriptionPlansService) {}

  @Get()
  async getAll(): Promise<SubscriptionPlan[]> {
    return this.service.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: number): Promise<SubscriptionPlan> {
    return this.service.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('subscriptions', 'manage')
  async create(@Body() body: Partial<SubscriptionPlan>) {
    return this.service.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('subscriptions', 'manage')
  async update(
    @Param('id') id: number,
    @Body() body: Partial<SubscriptionPlan>
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('subscriptions', 'manage')
  async delete(@Param('id') id: number) {
    return this.service.delete(id);
  }
}
