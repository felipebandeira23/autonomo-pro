import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TaxModule } from './tax/tax.module';
import { PdfModule } from './pdf/pdf.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [PrismaModule, TaxModule, PdfModule, PaymentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
