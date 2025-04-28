import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { SubscriptionPlansService } from './subscription-plans.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FastifyRequest } from 'fastify';
import { SubscriptionPlan } from './subscription-plan.entity';

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

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: FastifyRequest, @Body() body: Partial<SubscriptionPlan>) {
    const user = req.user as any;
    return this.service.create(body, user.role_id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Req() req: FastifyRequest, @Param('id') id: number, @Body() body: Partial<SubscriptionPlan>) {
    const user = req.user as any;
    return this.service.update(id, body, user.role_id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Req() req: FastifyRequest, @Param('id') id: number) {
    const user = req.user as any;
    return this.service.delete(id, user.role_id);
  }
}