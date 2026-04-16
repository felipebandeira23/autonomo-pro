import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { APP_GUARD } from '@nestjs/core';
import { TenantAccessGuard } from './auth/tenant.guard';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TaxModule } from './tax/tax.module';
import { PdfModule } from './pdf/pdf.module';
import { PaymentModule } from './payment/payment.module';
import { ProfessionalsModule } from './professionals/professionals.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    TaxModule,
    PdfModule,
    PaymentModule,
    ProfessionalsModule,
    DashboardModule,
    TenantsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: TenantAccessGuard,
    },
  ],
})
export class AppModule {}
