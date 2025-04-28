import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessSetting } from './business-setting.entity';
import { BusinessSettingsService } from './business-settings.service';
import { BusinessSettingsController } from './business-settings.controller';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessSetting]),PermissionsModule],
  providers: [BusinessSettingsService],
  controllers: [BusinessSettingsController],
  exports: [BusinessSettingsService],
})
export class BusinessSettingsModule {}