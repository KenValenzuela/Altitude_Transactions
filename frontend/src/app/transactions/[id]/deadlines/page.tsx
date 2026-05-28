'use client';
import { useParams } from 'next/navigation';
import { useScreenNav } from '@/lib/navigation';
import { TransactionGate } from '@/components/transaction/TransactionGate';
import { ScreenDeadlines } from '@/components/screens/ScreenDeadlines';

export default function DeadlinesPage() {
  const { id } = useParams<{ id: string }>();
  const go = useScreenNav(id);
  return (
    <TransactionGate
      id={id}
      render={(detail) => (
        <ScreenDeadlines
          go={go}
          deadlines={detail.deadlines}
          closeDate={detail.money.closeDate}
          daysToClose={detail.money.daysToClose}
          title={detail.address}
        />
      )}
    />
  );
}
