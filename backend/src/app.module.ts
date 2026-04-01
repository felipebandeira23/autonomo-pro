import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TaxModule } from './tax/tax.module';
import { PdfModule } from './pdf/pdf.module';
import { PaymentModule } from './payment/payment.module';
import { ProfessionalsModule } from './professionals/professionals.module';

@Module({
  imports: [PrismaModule, TaxModule, PdfModule, PaymentModule, ProfessionalsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
