import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LeaveRequest } from './leave-request.entity'
import { LeaveRequestsService } from './leave-requests.service'
import { LeaveRequestsController } from './leave-requests.controller'
import { PermissionsModule } from '../permissions/permissions.module' 
@Module({
  imports: [TypeOrmModule.forFeature([LeaveRequest]),PermissionsModule,],
  controllers: [LeaveRequestsController],
  providers: [LeaveRequestsService],
})
export class LeaveRequestsModule {}