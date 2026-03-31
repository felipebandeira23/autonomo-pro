import { notFound } from 'next/navigation';
import PagamentoDetalheClient from '@/components/PagamentoDetalheClient';
import { getPaymentByCode } from '@/lib/mock-data';

export default async function PagamentoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log("ID:", id);
  const payment = getPaymentByCode(id);

  if (!payment) {
    notFound();
  }

  return <PagamentoDetalheClient payment={payment} />;
}
