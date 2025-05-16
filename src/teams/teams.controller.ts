import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common'
import { TeamsService } from './teams.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { PermissionsGuard } from '../common/guards/permissions.guard'
import { Permissions } from '../common/decorators/permissions.decorator'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../users/user.entity'
import { Req } from '@nestjs/common'
@Controller('teams')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TeamsController {
  constructor(
    private readonly teamsService: TeamsService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>, // Injecting UserRepo for team members
  ) {}

  @Get()
  @Permissions('teams', 'view')
  getAll(@Req() req) {
  const companyId = req.user.company_id;
  return this.teamsService.findByCompany(companyId)
}


  @Get('company/:companyId')
  @Permissions('teams', 'view')
  getByCompany(@Param('companyId') companyId: number) {
    return this.teamsService.findByCompany(+companyId)
  }

  @Get(':id/members')
  @Permissions('users', 'view')
  getTeamMembers(@Param('id') id: number, @Req() req) {
    const companyId = req.user.company_id
    return this.userRepo.find({
      where: {
        team_id: id,
        company_id: companyId, 
      },
    })
  }
  

  @Post()
  @Permissions('teams', 'manage')
  create(@Body() body: any, @Req() req) {
    console.log(" REQ.USER:", req.user)
    return this.teamsService.create({
      ...body,
      company_id: req.user.company_id, 
    })
  }
  

  @Patch(':id')
  @Permissions('teams', 'manage')
  update(@Param('id') id: number, @Body() body: any) {
    return this.teamsService.update(+id, body)
  }

  @Delete(':id')
  @Permissions('teams', 'manage')
  remove(@Param('id') id: number) {
    return this.teamsService.delete(+id)
  }
}
