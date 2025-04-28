import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UploadService } from '../common/upload/upload.service';
import { PermissionsModule } from '../permissions/permissions.module';
import { EmployeeInvite } from '../employee-invites/employee-invite.entity' 

@Module({
  imports: [
    TypeOrmModule.forFeature([User,EmployeeInvite]),
    PermissionsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UploadService],  
  exports: [UsersService],
})
export class UsersModule {}

