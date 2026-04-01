import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

const mockPrisma = {
  professional: { count: jest.fn() },
  payment: { findMany: jest.fn(), count: jest.fn() },
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  function setupMocks(autonomos = 3, prevAutonomos = 3, payments: any[] = [], emAnalise = 1, rejeitados = 0) {
    mockPrisma.professional.count
      .mockResolvedValueOnce(autonomos)   // ativos
      .mockResolvedValueOnce(prevAutonomos); // prev ativos
    mockPrisma.payment.findMany.mockResolvedValue(payments);
    mockPrisma.payment.count
      .mockResolvedValueOnce(emAnalise)   // lancamentosEmAnalise
      .mockResolvedValueOnce(rejeitados); // rejeitados UFRJ
  }

  it('deve lançar BadRequestException para referência inválida', async () => {
    await expect(service.getDashboard('fevereiro/2026')).rejects.toThrow(BadRequestException);
    await expect(service.getDashboard('13-2026')).rejects.toThrow(BadRequestException);
  });

  it('os campos monetários nunca devem ser NaN', async () => {
    setupMocks(5, 4, [
      { id: '1', code: 'RPA-1', grossValue: null, inssValue: undefined, irrfValue: '123,45', netValue: 0, status: 'PAID', paymentDate: new Date('2026-02-10'), tenantId: 'ufrj', professional: { name: 'Test' } },
    ]);
    const result = await service.getDashboard('2026-02');
    expect(Number.isNaN(result.valorBrutoRepassado)).toBe(false);
    expect(Number.isNaN(result.impostosRetidos)).toBe(false);
    expect(result.valorBrutoRepassado).toBe(0); // null → 0
  });

  it('deve calcular variação de autônomos corretamente', async () => {
    setupMocks(10, 8);
    const result = await service.getDashboard('2026-02');
    expect(result.variacaoAutonomosMes).toBe(2);
  });

  it('deve retornar geradoEm como ISO string', async () => {
    setupMocks();
    const result = await service.getDashboard('2026-02');
    expect(() => new Date(result.geradoEm).toISOString()).not.toThrow();
  });

  it('totalGuiasPendentes deve ser 0 para tenant sem UFRJ', async () => {
    setupMocks(5, 5, [], 0, 0);
    const result = await service.getDashboard('2026-02', 'coppetec-id', 'UNIT_OPERATOR');
    expect(result.totalGuiasPendentes).toBe(0);
  });

  it('totalGuiasPendentes deve incluir base de 14 para UFRJ', async () => {
    setupMocks(5, 5, [], 0, 2);
    const result = await service.getDashboard('2026-02', 'ufrj-id', 'UNIT_OPERATOR');
    expect(result.totalGuiasPendentes).toBe(16); // 14 + 2 rejeitados
  });
});
