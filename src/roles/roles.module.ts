import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { PermissionsModule } from '../permissions/permissions.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    PermissionsModule,  
  ],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
