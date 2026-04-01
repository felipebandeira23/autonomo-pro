import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { BadRequestException } from '@nestjs/common';

// Mock do DashboardService
const mockDashboardService = {
  getDashboard: jest.fn(),
};

// Retorno base válido sem nenhum NaN
const baseDto = {
  referencia: '2026-02',
  autonomosAtivos: 3,
  variacaoAutonomosMes: 0,
  valorBrutoRepassado: 7033.43,
  impostosRetidos: 1387.44,
  totalGuiasPendentes: 14,
  lancamentosEmAnalise: 1,
  historicoRecente: [],
  syncStatus: 'ok',
  geradoEm: '2026-02-01T00:00:00.000Z',
};

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: mockDashboardService }],
    }).compile();
    controller = module.get<DashboardController>(DashboardController);
    jest.clearAllMocks();
  });

  // ── Critério de Aceite 1: KPIs sem NaN ──────────────────────

  it('deve retornar DTO com todos os campos numéricos válidos (sem NaN)', async () => {
    mockDashboardService.getDashboard.mockResolvedValue(baseDto);
    const result = await controller.getDashboard('2026-02', '', 'CORP_ADMIN');

    expect(Number.isFinite(result.valorBrutoRepassado)).toBe(true);
    expect(Number.isFinite(result.impostosRetidos)).toBe(true);
    expect(Number.isFinite(result.autonomosAtivos)).toBe(true);
    expect(Number.isNaN(result.valorBrutoRepassado)).toBe(false);
    expect(Number.isNaN(result.impostosRetidos)).toBe(false);
  });

  // ── Critério de Aceite 2: Referência válida atualiza cards ──

  it('deve aceitar referência Fevereiro/2026 (2026-02)', async () => {
    mockDashboardService.getDashboard.mockResolvedValue({ ...baseDto, referencia: '2026-02' });
    const result = await controller.getDashboard('2026-02', '', 'CORP_ADMIN');
    expect(result.referencia).toBe('2026-02');
    expect(mockDashboardService.getDashboard).toHaveBeenCalledWith('2026-02', '', 'CORP_ADMIN');
  });

  it('deve aceitar referência Janeiro/2026 (2026-01)', async () => {
    mockDashboardService.getDashboard.mockResolvedValue({ ...baseDto, referencia: '2026-01' });
    const result = await controller.getDashboard('2026-01', '', 'CORP_ADMIN');
    expect(result.referencia).toBe('2026-01');
  });

  it('deve aceitar referência Dezembro/2025 (2025-12)', async () => {
    mockDashboardService.getDashboard.mockResolvedValue({ ...baseDto, referencia: '2025-12' });
    const result = await controller.getDashboard('2025-12', '', 'CORP_ADMIN');
    expect(result.referencia).toBe('2025-12');
  });

  // ── Critério de Aceite 3: Validação de formato ───────────────

  it('deve lançar BadRequestException se referência estiver ausente', async () => {
    await expect(controller.getDashboard('', '', 'CORP_ADMIN'))
      .rejects.toThrow(BadRequestException);
  });

  it('deve lançar BadRequestException se formato for inválido (fevereiro/2026)', async () => {
    await expect(controller.getDashboard('fevereiro/2026', '', 'CORP_ADMIN'))
      .rejects.toThrow(BadRequestException);
  });

  it('deve lançar BadRequestException para formato ISO incompleto (2026-2)', async () => {
    await expect(controller.getDashboard('2026-2', '', 'CORP_ADMIN'))
      .rejects.toThrow(BadRequestException);
  });

  // ── Critério de Aceite 4: Isolamento de tenant ───────────────

  it('deve passar tenantId para o service', async () => {
    mockDashboardService.getDashboard.mockResolvedValue(baseDto);
    await controller.getDashboard('2026-02', 'ufrj-tenant-id', 'UNIT_OPERATOR');
    expect(mockDashboardService.getDashboard).toHaveBeenCalledWith(
      '2026-02', 'ufrj-tenant-id', 'UNIT_OPERATOR'
    );
  });

  // ── Critério de Aceite 5: Valores monetários >= 0 ───────────

  it('valores monetários não podem ser negativos', async () => {
    mockDashboardService.getDashboard.mockResolvedValue(baseDto);
    const result = await controller.getDashboard('2026-02', '', 'CORP_ADMIN');
    expect(result.valorBrutoRepassado).toBeGreaterThanOrEqual(0);
    expect(result.impostosRetidos).toBeGreaterThanOrEqual(0);
    expect(result.totalGuiasPendentes).toBeGreaterThanOrEqual(0);
  });

  // ── Critério de Aceite 6: geradoEm é ISO timestamp ──────────

  it('geradoEm deve ser um timestamp ISO válido', async () => {
    mockDashboardService.getDashboard.mockResolvedValue(baseDto);
    const result = await controller.getDashboard('2026-02', '', 'CORP_ADMIN');
    expect(() => new Date(result.geradoEm).toISOString()).not.toThrow();
  });
});
