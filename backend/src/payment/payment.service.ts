import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaxService } from '../tax/tax.service';
import { PdfService } from '../pdf/pdf.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly taxService: TaxService,
    private readonly pdfService: PdfService
  ) {}

  async createPayment(data: { professionalId: string, taxConfigId: string, grossValue: number, competence: string, paymentDate: string }) {
    const prof = await this.prisma.professional.findUnique({ where: { id: data.professionalId } });
    if (!prof) throw new NotFoundException('Autônomo não encontrado no cadastro base do Governo.');

    const result = await this.taxService.calculate(data.grossValue, data.taxConfigId, prof.numDependents);

    const payment = await this.prisma.payment.create({
      data: {
        professionalId: data.professionalId,
        taxConfigId: data.taxConfigId,
        tenantId: prof.tenantId,
        competence: data.competence,
        paymentDate: new Date(data.paymentDate),
        grossValue: result.grossValue,
        inssValue: result.inssValue,
        irrfValue: result.irrfValue,
        netValue: result.netValue
      }
    });

    return payment;
  }

  async getAllPayments() {
    return this.prisma.payment.findMany({
      include: { professional: true, taxConfig: true },
      orderBy: { paymentDate: 'desc' }
    });
  }

  async generateReceipt(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { professional: true, tenant: true }
    });
    
    if (!payment) throw new NotFoundException('Pagamento inexistente no sistema.');

    // Design System do Recibo de Pagamento Autônomo com Identidade Corporativa
    const htmlContent = `
      <html>
        <body style="font-family: 'Inter', Helvetica, sans-serif; padding: 50px; color: #172b4d; background: #ffffff;">
          <div style="border-bottom: 3px solid #0052cc; padding-bottom: 24px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
              <h1 style="color: #0052cc; font-size: 28px; margin: 0 0 10px 0;">Recibo de Pagamento a Autônomo</h1>
              <h3 style="color: #5e6c84; font-size: 16px; margin: 0; font-weight: 500;">AutônomoPro Cloud System</h3>
            </div>
            <div style="text-align: right;">
              <h3 style="margin: 0 0 8px 0; font-size: 18px;">${payment.tenant.name}</h3>
              <p style="margin: 0; color: #5e6c84; font-size: 14px;">CNPJ: ${payment.tenant.document}</p>
            </div>
          </div>
          
          <div style="background: #f4f5f7; padding: 20px; border-radius: 8px; margin-bottom: 40px;">
            <p style="margin: 0 0 10px 0;"><strong>Favorecido:</strong> ${payment.professional.name}</p>
            <p style="margin: 0 0 10px 0;"><strong>CPF Base:</strong> ${payment.professional.document}</p>
            <p style="margin: 0;"><strong>Competência Fiscal:</strong> ${payment.competence}</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 30px; font-size: 15px;">
            <thead>
              <tr style="background: #091e42; color: white;">
                <th style="padding:14px; text-align:left; border-radius: 4px 0 0 4px;">Descrição dos Rendimentos</th>
                <th style="padding:14px; text-align:right; border-radius: 0 4px 4px 0;">Valor (BRL)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style="padding:16px 14px; border-bottom: 1px solid #dfe1e6;">Pagamento por Serviços Prestados</td><td style="padding:16px 14px; text-align:right; border-bottom: 1px solid #dfe1e6; font-weight: 500;">R$ ${payment.grossValue}</td></tr>
              <tr><td style="padding:16px 14px; border-bottom: 1px solid #dfe1e6; color: #de350b;">(-) Desconto INSS Retido na Fonte</td><td style="padding:16px 14px; text-align:right; border-bottom: 1px solid #dfe1e6; color: #de350b;">R$ ${payment.inssValue}</td></tr>
              <tr><td style="padding:16px 14px; border-bottom: 2px solid #dfe1e6; color: #de350b;">(-) Desconto Imposto de Renda (IRRF)</td><td style="padding:16px 14px; text-align:right; border-bottom: 2px solid #dfe1e6; color: #de350b;">R$ ${payment.irrfValue}</td></tr>
              <tr style="background: #deebff;"><td style="padding:18px 14px; font-weight:bold; font-size: 16px; color: #0052cc;">Valor Líquido Repassado</td><td style="padding:18px 14px; text-align:right; font-weight:bold; font-size: 18px; color: #0052cc;">R$ ${payment.netValue}</td></tr>
            </tbody>
          </table>

          <div style="margin-top: 80px; text-align: center; color: #5e6c84;">
            <p style="margin-bottom: 10px;">________________________________________________________</p>
            <p>Assinatura Verificada do Prestador de Serviços</p>
            <p style="font-size: 12px; margin-top: 40px; color: #a5adba;">Gerado eletronicamente através da plataforma AutônomoPro.</p>
          </div>
        </body>
      </html>
    `;

    return this.pdfService.generatePdf(htmlContent);
  }
}
