export type PaymentStatus = 'elaboracao' | 'aprovacao' | 'pago' | 'rejeitado';

export type AutonomoRecord = {
  id: number;
  nome: string;
  cpf: string;
  dep: number;
  repasse: string;
  status: 'Ativo' | 'Inativo' | 'Bloqueado';
  tenant: string;
};

export const mockAutonomos: AutonomoRecord[] = [
  { id: 1, nome: 'Eduardo Raupp de Vargas', cpf: '***.341.22*-**', dep: 1, repasse: 'R$ 14.599,23', status: 'Ativo', tenant: 'UFRJ' },
  { id: 2, nome: 'Claudia Affonso Silva Araujo', cpf: '***.112.55*-**', dep: 0, repasse: 'R$ 5.967,49', status: 'Ativo', tenant: 'COPPETEC' },
  { id: 3, nome: 'Adriana Aparecida Marques', cpf: '***.892.11*-**', dep: 2, repasse: 'R$ 4.124,24', status: 'Ativo', tenant: 'UFRJ' },
  { id: 4, nome: 'Joao Carlos da Silva', cpf: '***.123.45*-**', dep: 0, repasse: 'R$ 2.500,00', status: 'Inativo', tenant: 'Corp' },
  { id: 5, nome: 'Maria Joana de Souza', cpf: '***.567.89*-**', dep: 1, repasse: 'R$ 1.200,00', status: 'Ativo', tenant: 'Auditoria' },
];

export type PaymentRecord = {
  id: string;
  ident: string;
  nome: string;
  cpf: string;
  convenio: string;
  tenantId: Exclude<TenantKey, 'corp'>;
  bruto: string;
  liquido: string;
  deducaoinss: string;
  deducoirrf: string;
  descontos: string;
  statusId: PaymentStatus;
  realid: string;
  /** ISO date string — competência do pagamento */
  data: string;
  /** Referência de competência no formato YYYY-MM */
  referencia: string;
};

export type TenantKey = 'corp' | 'ufrj' | 'coppetec';

export const paymentRecords: PaymentRecord[] = [
  {
    id: '1042',
    ident: '#RPA-1042',
    nome: 'Eduardo Raupp de Vargas',
    cpf: '***.341.22*-**',
    convenio: 'Pos-Graduação UFRJ',
    tenantId: 'ufrj',
    bruto: 'R$ 4.533,43',
    liquido: 'R$ 3.789,71',
    deducaoinss: '498,67',
    deducoirrf: '245,05',
    descontos: 'R$ 743,72',
    statusId: 'pago',
    realid: '9b2fc304-4537-4d9f-a2b1-1234567890f1',
    data: '2026-02-13',
    referencia: '2026-02',
  },
  {
    id: '1043',
    ident: '#RPA-1043',
    nome: 'Débora Alves dos Santos',
    cpf: '***.892.11*-**',
    convenio: 'Auditoria Independente',
    tenantId: 'coppetec',
    bruto: 'R$ 18.250,00',
    liquido: 'R$ 15.794,90',
    deducaoinss: '932,32',
    deducoirrf: '1.522,78',
    descontos: 'R$ 2.455,10',
    statusId: 'aprovacao',
    realid: 'c83fb304-4537-4d9f-a2b1-1234567812ab',
    data: '2026-02-10',
    referencia: '2026-02',
  },
  {
    id: '1044',
    ident: '#RPA-1044',
    nome: 'João Carlos da Silva',
    cpf: '***.123.45*-**',
    convenio: 'Consultoria Acadêmica',
    tenantId: 'ufrj',
    bruto: 'R$ 2.500,00',
    liquido: 'R$ 2.500,00',
    deducaoinss: '0,00',
    deducoirrf: '0,00',
    descontos: '0,00',
    statusId: 'elaboracao',
    realid: 'e12da304-4537-4d9f-a2b1-1234567899cc',
    data: '2026-02-08',
    referencia: '2026-02',
  },
  {
    id: '1038',
    ident: '#RPA-1038',
    nome: 'Adriana Aparecida Marques',
    cpf: '***.892.11*-**',
    convenio: 'Pesquisa Avançada UFRJ',
    tenantId: 'ufrj',
    bruto: 'R$ 4.124,24',
    liquido: 'R$ 3.480,55',
    deducaoinss: '453,67',
    deducoirrf: '190,02',
    descontos: 'R$ 643,69',
    statusId: 'pago',
    realid: 'f44bc304-4537-4d9f-a2b1-aabbcc112233',
    data: '2026-01-20',
    referencia: '2026-01',
  },
  {
    id: '1035',
    ident: '#RPA-1035',
    nome: 'Claudia Affonso Silva Araujo',
    cpf: '***.112.55*-**',
    convenio: 'Fundação COPPETEC — Extensão',
    tenantId: 'coppetec',
    bruto: 'R$ 5.967,49',
    liquido: 'R$ 5.083,63',
    deducaoinss: '656,42',
    deducoirrf: '227,44',
    descontos: 'R$ 883,86',
    statusId: 'pago',
    realid: 'a99bc304-4537-4d9f-a2b1-112233445566',
    data: '2025-12-18',
    referencia: '2025-12',
  },
];

export const tenantSummaries = {
  corp: {
    id: 'corp',
    label: 'Corporativo',
    ativos: paymentRecords.length,
    repasses: 'R$ 1.25M',
    retidos: 'R$ 384k',
    status: 'Sincronizado',
  },
  ufrj: {
    id: 'ufrj',
    label: 'UFRJ - Reitoria',
    ativos: 84,
    repasses: 'R$ 800k',
    retidos: 'R$ 200k',
    status: 'Sincronizado',
    usuarios: 12,
    baseAtivos: 84,
    cnpj: '33.663.683/0001-16',
    repassesMes: 'R$ 1.2Mi',
    impostosMes: 'R$ 384k',
    pendencias: '14 Guias',
    pendenciasCriticas: true,
  },
  coppetec: {
    id: 'coppetec',
    label: 'Fundacao COPPETEC',
    ativos: 58,
    repasses: 'R$ 450k',
    retidos: 'R$ 184k',
    status: 'Atrasado',
    usuarios: 5,
    baseAtivos: 58,
    cnpj: '29.432.894/0001-09',
    repassesMes: 'R$ 412k',
    impostosMes: 'R$ 84k',
    pendencias: 'Nenhuma',
    pendenciasCriticas: false,
  },
} as const;

export const irrfBrackets = [
  { faixa: 'Ate R$ 2.259,20', aliquota: '0,00', parcelaDedutivel: '0,00' },
  { faixa: 'De R$ 2.259,21 ate R$ 2.828,65', aliquota: '7,50', parcelaDedutivel: '169,44' },
  { faixa: 'De R$ 2.828,66 ate R$ 3.751,05', aliquota: '15,00', parcelaDedutivel: '381,44' },
  { faixa: 'De R$ 3.751,06 ate R$ 4.664,68', aliquota: '22,50', parcelaDedutivel: '662,77' },
  { faixa: 'Acima de R$ 4.664,68', aliquota: '27,50', parcelaDedutivel: '896,00' },
];

export function getPaymentByCode(id: string) {
  return paymentRecords.find((payment) => payment.ident.replace('#', '') === id);
}

export function getPaymentStatusMeta(statusId: PaymentStatus) {
  if (statusId === 'pago') {
    return {
      badge: 'Pago',
      detailBadge: 'Ordem de Pagamento Aprovada',
      style: 'rgba(16, 185, 129, 0.1)',
      color: 'var(--success)',
    };
  }

  if (statusId === 'aprovacao') {
    return {
      badge: 'Aprovacao Financeira',
      detailBadge: 'Em Aprovacao',
      style: 'rgba(245, 158, 11, 0.1)',
      color: '#d97706',
    };
  }

  if (statusId === 'rejeitado') {
    return {
      badge: 'Rejeitado',
      detailBadge: 'RPA Rejeitada Internamente',
      style: 'rgba(222, 53, 11, 0.1)',
      color: 'var(--danger)',
    };
  }

  return {
    badge: 'Em Elaboracao',
    detailBadge: 'Em Elaboracao',
    style: 'rgba(9, 30, 66, 0.1)',
    color: 'var(--text-main)',
  };
}
