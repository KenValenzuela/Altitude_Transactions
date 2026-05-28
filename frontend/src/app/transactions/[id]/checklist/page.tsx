'use client';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { useScreenNav } from '@/lib/navigation';
import { TransactionGate } from '@/components/transaction/TransactionGate';
import { ScreenChecklist } from '@/components/screens/ScreenChecklist';

export default function ChecklistPage() {
  const { id } = useParams<{ id: string }>();
  const go = useScreenNav(id);
  return (
    <TransactionGate
      id={id}
      render={(detail) => (
        <ScreenChecklist
          go={go}
          groups={detail.tasks}
          title={detail.address}
          onSetState={(taskId, state) => api.updateTask(taskId, state).then(() => undefined)}
        />
      )}
    />
  );
}
