import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Company } from './company.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { RegisterCompanyDto } from './dto/register-company.dto'
import { UsePipes, ValidationPipe } from '@nestjs/common'




@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}


  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('companies', 'view')
  findAll(): Promise<Company[]> {
    return this.companiesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('companies', 'create')
  create(@Body() body: Partial<Company>): Promise<Company> {
    return this.companiesService.create(body);
  }
  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async register(@Body() body: RegisterCompanyDto) {
    return this.companiesService.registerCompanyWithOwner(body)
  }
}