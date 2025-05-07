import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Salary } from './salaries.entity';
import { SalariesService } from './salaries.service';
import { SalariesController } from './salaries.controller';
import { PermissionsModule } from '../permissions/permissions.module';
import { UploadService } from '../common/upload/upload.service';  

@Module({
  imports: [
    TypeOrmModule.forFeature([Salary]),
    PermissionsModule,
  ],
  providers: [SalariesService, UploadService],  
  controllers: [SalariesController],
})
export class SalariesModule {}
