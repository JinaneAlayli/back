import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeInvite } from './employee-invite.entity';
import { EmployeeInvitesService } from './employee-invites.service';
import { EmployeeInvitesController } from './employee-invites.controller';
import { PermissionsModule } from '../permissions/permissions.module';
import { User } from '../users/user.entity';
import { Company } from '../companies/company.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeeInvite, User, Company]),
    PermissionsModule,
    UsersModule,
  ],
  providers: [EmployeeInvitesService],
  controllers: [EmployeeInvitesController],
  exports: [EmployeeInvitesService],
})
export class EmployeeInvitesModule {}
