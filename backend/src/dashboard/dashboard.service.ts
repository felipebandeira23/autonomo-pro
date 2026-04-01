import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Contrato tipado retornado pelo endpoint GET /dashboard */
export interface DashboardDto {
  referencia: string;
  autonomosAtivos: number;
  variacaoAutonomosMes: number;
  valorBrutoRepassado: number;
  impostosRetidos: number;
  totalGuiasPendentes: number;
  lancamentosEmAnalise: number;
  historicoRecente: HistoricoItem[];
  syncStatus: 'ok' | 'atrasado' | 'erro';
  geradoEm: string;
}

export interface HistoricoItem {
  id: string;
  code: string;
  profissional: string;
  bruto: number;
  inss: number;
  irrf: number;
  liquido: number;
  status: string;
  data: string;
  tenantId: string;
}

/** Garante retorno numérico seguro — nunca NaN */
function safeNum(val: unknown): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

/** Reconstrói um range de datas para a referência YYYY-MM */
function buildDateRange(referencia: string): { start: Date; end: Date } {
  const [year, month] = referencia.split('-').map(Number);
  if (!year || !month || month < 1 || month > 12) {
    throw new BadRequestException(`Referência inválida: "${referencia}". Use formato YYYY-MM.`);
  }
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999); // último dia do mês
  return { start, end };
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(referencia: string, tenantId?: string, userRole?: string): Promise<DashboardDto> {
    const { start, end } = buildDateRange(referencia);

    // Filtro de tenant: CORP_ADMIN e AUDITOR veem tudo
    const tenantFilter = (userRole === 'CORP_ADMIN' || userRole === 'AUDITOR' || !tenantId)
      ? {}
      : { tenantId };

    // ── Autônomos Ativos ──────────────────────────────────────
    const autonomosAtivos = await this.prisma.professional.count({
      where: { status: 'ACTIVE', ...tenantFilter },
    });

    // Mês anterior para delta
    const refDate = new Date(start);
    refDate.setMonth(refDate.getMonth() - 1);
    const prevStart = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
    const prevEnd = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0, 23, 59, 59);

    const autonomosPrevAtivos = await this.prisma.professional.count({
      where: {
        status: 'ACTIVE',
        createdAt: { lte: prevEnd },
        ...tenantFilter,
      },
    });

    // ── Pagamentos da Referência ──────────────────────────────
    const payments = await this.prisma.payment.findMany({
      where: {
        paymentDate: { gte: start, lte: end },
        ...tenantFilter,
      },
      include: { professional: { select: { name: true } } },
      orderBy: { paymentDate: 'desc' },
      take: 50,
    });

    // ── Agregações Seguras (nunca NaN) ────────────────────────
    const valorBrutoRepassado = payments.reduce((acc, p) => acc + safeNum(p.grossValue), 0);
    const impostosRetidos = payments.reduce(
      (acc, p) => acc + safeNum(p.inssValue) + safeNum(p.irrfValue),
      0,
    );

    // ── Histórico Recente ─────────────────────────────────────
    const historicoRecente: HistoricoItem[] = payments.slice(0, 10).map((p) => ({
      id: p.id,
      code: p.code,
      profissional: p.professional?.name ?? 'Desconhecido',
      bruto: safeNum(p.grossValue),
      inss: safeNum(p.inssValue),
      irrf: safeNum(p.irrfValue),
      liquido: safeNum(p.netValue),
      status: p.status ?? 'DRAFT',
      data: p.paymentDate?.toISOString().split('T')[0] ?? '',
      tenantId: p.tenantId,
    }));

    // ── Em Análise ────────────────────────────────────────────
    const lancamentosEmAnalise = await this.prisma.payment.count({
      where: {
        status: 'PENDING_APPROVAL',
        paymentDate: { gte: start, lte: end },
        ...tenantFilter,
      },
    });

    // ── Guias Pendentes (UFRJ business rule) ─────────────────
    // Base de 14 guias fixas + pagamentos rejeitados da UFRJ no período
    const rejectUfrj = await this.prisma.payment.count({
      where: {
        status: 'REJECTED',
        tenantId: { contains: 'ufrj' },
        paymentDate: { gte: start, lte: end },
      },
    });
    const totalGuiasPendentes =
      (!tenantId || tenantId === '' || tenantId.includes('ufrj'))
        ? 14 + rejectUfrj
        : 0;

    const syncStatus: 'ok' | 'atrasado' | 'erro' = 'ok';

    return {
      referencia,
      autonomosAtivos,
      variacaoAutonomosMes: autonomosAtivos - autonomosPrevAtivos,
      valorBrutoRepassado: Number(valorBrutoRepassado.toFixed(2)),
      impostosRetidos: Number(impostosRetidos.toFixed(2)),
      totalGuiasPendentes,
      lancamentosEmAnalise,
      historicoRecente,
      syncStatus,
      geradoEm: new Date().toISOString(),
    };
  }
}
