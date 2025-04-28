import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { PermissionsModule } from '../permissions/permissions.module';
import { User } from 'src/users/user.entity';
import { Payment } from 'src/payments/payment.entity';
import { SubscriptionPlan } from 'src/subscription-plans/subscription-plan.entity';
import { PaymentsModule } from 'src/payments/payments.module';
import { SubscriptionPlansModule } from 'src/subscription-plans/subscription-plans.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, User, Payment, SubscriptionPlan]),
    PermissionsModule,
    PaymentsModule,
    SubscriptionPlansModule,
  ],
  providers: [CompaniesService],
  controllers: [CompaniesController],
  exports: [CompaniesService],
})
export class CompaniesModule {}
