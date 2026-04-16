import { BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';

describe('PaymentService status transitions', () => {
  const prisma = {
    professional: { findUnique: jest.fn() },
    payment: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  } as any;

  const taxService = { calculate: jest.fn() } as any;
  const pdfService = { generatePdf: jest.fn() } as any;

  let service: PaymentService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new PaymentService(prisma, taxService, pdfService);
  });

  it('submitPayment should move DRAFT to PENDING_APPROVAL', async () => {
    prisma.payment.findUnique.mockResolvedValue({ id: 'p1', status: 'DRAFT' });
    prisma.payment.update.mockResolvedValue({
      id: 'p1',
      status: 'PENDING_APPROVAL',
    });

    const result = await service.submitPayment('p1');

    expect(result.status).toBe('PENDING_APPROVAL');
    expect(prisma.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'p1' },
        data: expect.objectContaining({ status: 'PENDING_APPROVAL' }),
      }),
    );
  });

  it('rejectPayment should fail when current status is not PENDING_APPROVAL', async () => {
    prisma.payment.findUnique.mockResolvedValue({ id: 'p1', status: 'DRAFT' });

    await expect(
      service.rejectPayment('p1', 'motivo válido'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
