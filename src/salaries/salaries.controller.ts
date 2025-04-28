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
} from '@nestjs/common'
import { SalariesService } from './salaries.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { PermissionsGuard } from '../common/guards/permissions.guard'
import { Permissions } from '../common/decorators/permissions.decorator'
import { FastifyRequest } from 'fastify'
import { BadRequestException } from '@nestjs/common'

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
    return this.service.findByUser(+userId)
  }

  @Get(':id')
  @Permissions('salaries', 'view')
  getOne(@Param('id') id: number) {
    return this.service.findOne(+id)
  }

  @Post()
@Permissions('salaries', 'create')
async create(@Body() body: any) {
  try {
    return await this.service.create(body)
  } catch (err) {
    console.error(' Salary creation failed:', err)
    throw err
  }
}


  @Patch(':id')
  @Permissions('salaries', 'update')
  update(@Param('id') id: number, @Body() body: any) {
    return this.service.update(+id, body)
  }

  @Delete(':id')
  @Permissions('salaries', 'delete')
  remove(@Param('id') id: number) {
    return this.service.delete(+id)
  }
}
