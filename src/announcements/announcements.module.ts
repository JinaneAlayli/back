import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Announcement } from './announcement.entity';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsController } from './announcements.controller';
import { PermissionsModule } from '../permissions/permissions.module';  

@Module({
  imports: [
    TypeOrmModule.forFeature([Announcement]),
    PermissionsModule,  
  ],
  providers: [AnnouncementsService],
  controllers: [AnnouncementsController],
})
export class AnnouncementsModule {}
