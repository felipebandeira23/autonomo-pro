import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool, { schema: 'autonomo' });
const prisma = new PrismaClient({ adapter });

async function main() {
  const corp = await prisma.tenant.upsert({
    where: { document: '00000000000191' },
    update: {},
    create: {
      name: 'Corp Admin',
      document: '00000000000191',
    },
  });

  const ufrj = await prisma.tenant.upsert({
    where: { document: '33663683000116' },
    update: {},
    create: {
      name: 'Universidade Federal do Rio de Janeiro',
      document: '33663683000116',
    },
  });

  // Limpando possível sujeira anterior devido ao uuid
  await prisma.professionalAuditLog.deleteMany();
  await prisma.legalDeduction.deleteMany();
  await prisma.externalInssSource.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.taxConfig.deleteMany();
  await prisma.professional.deleteMany();
  await prisma.user.deleteMany();

  const userAdmin = await prisma.user.upsert({
    where: { email: 'admin@corp.br' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@corp.br',
      role: 'CORP_ADMIN',
      tenantId: null,
    }
  });

  const userUfrj = await prisma.user.upsert({
    where: { email: 'financeiro@ufrj.br' },
    update: {},
    create: {
      name: 'Financeiro UFRJ',
      email: 'financeiro@ufrj.br',
      role: 'UNIT_OPERATOR',
      tenantId: ufrj.id,
    }
  });

  const userAuditor = await prisma.user.upsert({
    where: { email: 'auditoria@gov.br' },
    update: {},
    create: {
      name: 'Auditor Externo',
      email: 'auditoria@gov.br',
      role: 'AUDITOR',
      tenantId: null,
    }
  });

  const config = await prisma.taxConfig.create({
    data: {
      year: 2026,
      tenantId: ufrj.id,
      inssRate: 0.1100,
      inssCeiling: 932.32,
      dependentDeduction: 189.59,
      irrfBrackets: [
        { min: 0, max: 2259.20, rate: 0, deduction: 0 },
        { min: 2259.21, max: 2828.65, rate: 7.5, deduction: 169.44 },
        { min: 2828.66, max: 3751.05, rate: 15.0, deduction: 381.44 },
        { min: 3751.06, max: 4664.68, rate: 22.5, deduction: 662.77 },
        { min: 4664.69, max: 9999999, rate: 27.5, deduction: 896.00 }
      ]
    }
  });

  const prof1 = await prisma.professional.upsert({
    where: { document: '12345678901' },
    update: {},
    create: {
      name: 'Eduardo Raupp de Vargas',
      document: '12345678901',
      numDependents: 1,
      tenantId: ufrj.id,
    }
  });

  const prof2 = await prisma.professional.upsert({
    where: { document: '98765432100' },
    update: {},
    create: {
      name: 'Joao Carlos da Silva',
      document: '98765432100',
      numDependents: 0,
      tenantId: ufrj.id,
    }
  });

  await prisma.externalInssSource.create({
    data: {
      professionalId: prof1.id,
      companyName: 'Empresa XYZ LTDA',
      cnpj: '12345678000199',
      amount: 450.00,
      competence: '02/2026'
    }
  });

  await prisma.legalDeduction.create({
    data: {
      professionalId: prof1.id,
      type: 'ALIMONY',
      amount: 300.00,
      description: 'Pensao alimenticia judicial'
    }
  });

  await prisma.professionalAuditLog.create({
    data: {
      professionalId: prof2.id,
      action: 'DEACTIVATE',
      reason: 'Solicitação de desligamento temporário - Processo 123/2026',
      performedById: userUfrj.id,
    }
  });

  await prisma.professional.update({
    where: { id: prof2.id },
    data: { status: 'INACTIVE' }
  });

  await prisma.payment.create({
    data: {
      code: 'RPA-1042',
      competence: '02/2026',
      paymentDate: new Date('2026-02-13T12:00:00Z'),
      grossValue: 4533.43,
      inssValue: 498.67,
      irrfValue: 245.05,
      netValue: 3789.71,
      status: 'PENDING_APPROVAL',
      convenio: 'Pós-Graduação UFRJ',
      professionalId: prof1.id,
      tenantId: ufrj.id,
      taxConfigId: config.id,
    }
  });

  await prisma.payment.create({
    data: {
      code: 'RPA-1044',
      competence: '02/2026',
      paymentDate: new Date('2026-02-15T12:00:00Z'),
      grossValue: 2500.00,
      inssValue: 275.00,
      irrfValue: 0.00,
      netValue: 2225.00,
      status: 'DRAFT',
      convenio: 'Consultoria Acadêmica',
      professionalId: prof2.id,
      tenantId: ufrj.id,
      taxConfigId: config.id,
    }
  });

  console.log('Seed do Prisma executado com sucesso: Tabelas Populosas!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
