import { ForbiddenException } from '@nestjs/common';
import { TenantsService } from './tenants.service';

describe('TenantsService', () => {
  const prisma = {
    tenant: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    professional: { count: jest.fn() },
    payment: { aggregate: jest.fn(), groupBy: jest.fn() },
  } as any;

  let service: TenantsService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new TenantsService(prisma);
  });

  it('findAll should scope unit operator to own tenant', async () => {
    prisma.tenant.findMany.mockResolvedValue([{ id: 'tenant-1' }]);

    const result = await service.findAll('UNIT_OPERATOR', 'tenant-1');

    expect(result).toEqual([{ id: 'tenant-1' }]);
    expect(prisma.tenant.findMany).toHaveBeenCalledWith({ where: { id: 'tenant-1' } });
  });

  it('create should block non CORP_ADMIN', async () => {
    await expect(
      service.create('UNIT_OPERATOR', { name: 'Tenant', document: '12345678000199' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
