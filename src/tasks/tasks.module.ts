import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PermissionsModule } from '../permissions/permissions.module'; // or correct path
import { UsersModule } from '../users/users.module'; // if needed

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    PermissionsModule,  
    UsersModule,         
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
