'use client';
import { useParams } from 'next/navigation';
import { useScreenNav } from '@/lib/navigation';
import { TransactionGate } from '@/components/transaction/TransactionGate';
import { ScreenOverview } from '@/components/screens/ScreenOverview';

export default function TransactionOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const go = useScreenNav(id);
  return <TransactionGate id={id} render={(detail) => <ScreenOverview go={go} detail={detail} />} />;
}
