import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PaymentsModule } from './payments/payments.module';
import { EmployeeInvitesModule } from './employee-invites/employee-invites.module';
import { BusinessSettingsModule } from './business-settings/business-settings.module';
import { CompaniesModule } from './companies/companies.module';
import { TeamsModule } from './teams/teams.module';
import { AttendanceModule } from './attendance/attendance.module';
import { SubscriptionPlansModule } from './subscription-plans/subscription-plans.module';
import { SubscriptionPlansController } from './subscription-plans/subscription-plans.controller';
import { SalariesModule } from './salaries/salaries.module';
import { TasksModule } from './tasks/tasks.module';
import { TasksController } from './tasks/tasks.controller';
import { AnnouncementsModule } from './announcements/announcements.module';
import { LeaveRequestsModule } from './leave-requests/leave-requests.module';
 
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get<string>('NODE_ENV') === 'production';

        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST', 'localhost'),
          port: parseInt(config.get<string>('DB_PORT', '5432')),
          username: config.get<string>('DB_USERNAME', 'postgres'),
          password: config.get<string>('DB_PASSWORD', ''),
          database: config.get<string>('DB_NAME', 'postgres'),
          synchronize: !isProd,
          autoLoadEntities: true,
          ssl: true,
          extra: {
            ssl: {
              rejectUnauthorized: false,
            },
          },
        };
      },
    }),

    RolesModule,
    PermissionsModule,
    UsersModule,
    AuthModule,
    PaymentsModule,
    CompaniesModule,
    BusinessSettingsModule,
    EmployeeInvitesModule,
    TeamsModule,
    AttendanceModule,
    SubscriptionPlansModule,
    SalariesModule,
    TasksModule,
    AnnouncementsModule,
    LeaveRequestsModule,
    
  ],
  })
export class AppModule {}
