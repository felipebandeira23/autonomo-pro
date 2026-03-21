import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
  deduction: number;
}

@Injectable()
export class TaxService {
  constructor(private readonly prisma: PrismaService) {}

  async calculate(grossValue: number, taxConfigId: string, dependentCount: number) {
    const config = await this.prisma.taxConfig.findUnique({
      where: { id: taxConfigId }
    });
    
    if (!config) throw new NotFoundException('Configuração fiscal não encontrada.');

    // Cálculo INSS com trava configurável
    let inssValue = grossValue * Number(config.inssRate);
    if (inssValue > Number(config.inssCeiling)) {
      inssValue = Number(config.inssCeiling);
    }

    // Base IRRF = Bruto - INSS - (Dependentes * DeducaoDependente)
    let baseIrrf = grossValue - inssValue - (dependentCount * Number(config.dependentDeduction));
    if (baseIrrf < 0) baseIrrf = 0;

    let irrfValue = 0;
    const brackets = config.irrfBrackets as unknown as TaxBracket[];
    
    // Motor configurável de faixas (flexível para a antiga e a nova regra de 2026/MP)
    for (const bracket of brackets) {
      if (baseIrrf > bracket.min) {
        let diff = (baseIrrf > (bracket.max || Infinity) ? bracket.max : baseIrrf) - bracket.min;
        if (diff > 0) irrfValue += diff * bracket.rate;
      }
    }

    // A lógica de "Redução Simplificada de 2026" (R$ 607) pode ser injetada via regra aqui
    // Baseada nas necessidades do Tenant

    const netValue = grossValue - inssValue - irrfValue;

    return {
      grossValue: Number(grossValue.toFixed(2)),
      inssValue: Number(inssValue.toFixed(2)),
      irrfValue: Number(irrfValue.toFixed(2)),
      netValue: Number(netValue.toFixed(2))
    };
  }
}
