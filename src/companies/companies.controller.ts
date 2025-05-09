import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Param, Patch, Delete
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
  @Post('renew')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('subscriptions', 'view')
  async renew(@Req() req: any) {
    const user = req.user;
    return this.companiesService.renewSubscription(user);
  }
  @Get('my-company')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('companies', 'view')
  async getMyCompany(@Req() req: any) {
    const user = req.user;
    return this.companiesService.findCompanyByOwnerId(user.id);
  }
  @Get('all')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('companies', 'view_all')
getAllCompanies(): Promise<Company[]> {
  return this.companiesService.getAllWithOwnersAndPlans();
}

@Patch(':id')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('companies', 'edit')
updateCompany(@Param('id') id: number, @Body() data: Partial<Company>) {
  return this.companiesService.updateCompany(+id, data);
}

@Delete(':id/hard')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('companies', 'delete')
hardDeleteCompany(@Param('id') id: number) {
  return this.companiesService.hardDeleteCompany(+id);
}


}