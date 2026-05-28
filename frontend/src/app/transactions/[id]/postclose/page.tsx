'use client';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { useScreenNav } from '@/lib/navigation';
import { TransactionGate } from '@/components/transaction/TransactionGate';
import { ScreenPostClose } from '@/components/screens/ScreenPostClose';

export default function PostClosePage() {
  const { id } = useParams<{ id: string }>();
  const go = useScreenNav(id);
  return (
    <TransactionGate
      id={id}
      render={(detail) => (
        <ScreenPostClose
          go={go}
          detail={detail}
          onSetState={(taskId, state) => api.updateTask(taskId, state).then(() => undefined)}
        />
      )}
    />
  );
}
