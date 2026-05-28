'use client';
import { useParams } from 'next/navigation';
import { useScreenNav } from '@/lib/navigation';
import { TransactionGate } from '@/components/transaction/TransactionGate';
import { ScreenSummary } from '@/components/screens/ScreenSummary';

export default function SummaryPage() {
  const { id } = useParams<{ id: string }>();
  const go = useScreenNav(id);
  return <TransactionGate id={id} render={(detail) => <ScreenSummary go={go} detail={detail} />} />;
}
