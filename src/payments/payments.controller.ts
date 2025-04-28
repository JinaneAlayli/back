import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    UseGuards,
  } from '@nestjs/common';
  import { PaymentsService } from './payments.service';
  import { Payment } from './payment.entity';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { PermissionsGuard } from '../common/guards/permissions.guard';
  import { Permissions } from '../common/decorators/permissions.decorator';
  
  @Controller('payments')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  export class PaymentsController {
    constructor(private readonly service: PaymentsService) {}
  
    @Get()
    @Permissions('payments', 'view')
    getAll(): Promise<Payment[]> {
      return this.service.findAll();
    }
  
    @Get(':companyId')
    @Permissions('payments', 'view')
    getByCompany(@Param('companyId') companyId: number): Promise<Payment[]> {
      return this.service.findByCompany(companyId);
    }
  
    @Post()
    @Permissions('payments', 'create')
    create(@Body() body: Partial<Payment>): Promise<Payment> {
      return this.service.create(body);
    }
  
    @Patch(':id')
    @Permissions('payments', 'update')
    update(@Param('id') id: number, @Body() body: Partial<Payment>): Promise<Payment> {
      return this.service.update(id, body);
    }
  }
  