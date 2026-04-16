import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ListPaymentsQueryDto } from './dto/list-payments-query.dto';
import { RejectPaymentDto } from './dto/reject-payment.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async create(@Body() body: CreatePaymentDto) {
    return this.paymentService.createPayment(body);
  }

  @Get()
  async findAll(
    @Query() query: ListPaymentsQueryDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-role') role: string,
  ) {
    return this.paymentService.getAllPayments(
      query,
      tenantId ?? '',
      role ?? '',
    );
  }

  @Patch(':id/submit')
  async submit(@Param('id') id: string) {
    return this.paymentService.submitPayment(id);
  }

  @Patch(':id/approve')
  async approve(@Param('id') id: string) {
    return this.paymentService.approvePayment(id);
  }

  @Patch(':id/reject')
  async reject(@Param('id') id: string, @Body() body: RejectPaymentDto) {
    return this.paymentService.rejectPayment(id, body.reason);
  }

  @Get(':id/receipt')
  async downloadReceipt(@Param('id') id: string, @Res() res: Response) {
    try {
      const pdfBuffer = await this.paymentService.generateReceipt(id);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=recibo-autonomo-${id}.pdf`,
        'Content-Length': pdfBuffer.length,
      });

      res.end(pdfBuffer);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno';
      res.status(500).json({ error: message });
    }
  }
}
