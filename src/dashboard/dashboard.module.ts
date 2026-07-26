import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CaseStudiesModule } from '../case-studies/case-studies.module';
import { CategoriesModule } from '../categories/categories.module';
import { ContactsModule } from '../contacts/contacts.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [AuthModule, CaseStudiesModule, CategoriesModule, ContactsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
