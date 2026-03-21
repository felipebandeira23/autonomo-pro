import { Controller, Post, Get, Body, Param, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Response } from 'express';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async create(@Body() body: any) {
    return this.paymentService.createPayment(body);
  }

  @Get()
  async findAll() {
    return this.paymentService.getAllPayments();
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
    } catch(err: any) {
        res.status(500).json({ error: err.message });
    }
  }
}
