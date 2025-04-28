import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './team.entity';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { PermissionsModule } from '../permissions/permissions.module';  
import { User } from '../users/user.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Team,User]),
    PermissionsModule, 
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
})
export class TeamsModule {}
