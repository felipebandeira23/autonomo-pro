import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TaxModule } from '../tax/tax.module';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [TaxModule, PdfModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
