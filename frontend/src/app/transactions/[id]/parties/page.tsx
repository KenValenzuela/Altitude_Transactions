'use client';
import { useParams } from 'next/navigation';
import { useScreenNav } from '@/lib/navigation';
import { TransactionGate } from '@/components/transaction/TransactionGate';
import { ScreenParties } from '@/components/screens/ScreenParties';

export default function PartiesPage() {
  const { id } = useParams<{ id: string }>();
  const go = useScreenNav(id);
  return (
    <TransactionGate
      id={id}
      render={(detail) => <ScreenParties go={go} parties={detail.parties} title={detail.address} />}
    />
  );
}
