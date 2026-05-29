'use client';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { useScreenNav } from '@/lib/navigation';
import { TransactionGate } from '@/components/transaction/TransactionGate';
import { ScreenDocuments } from '@/components/screens/ScreenDocuments';

export default function DocumentsPage() {
  const { id } = useParams<{ id: string }>();
  const go = useScreenNav(id);
  return (
    <TransactionGate
      id={id}
      render={(detail) => (
        <ScreenDocuments
          go={go}
          documents={detail.documents}
          title={detail.address}
          onSetState={(docId, state) => api.updateDocument(docId, state).then(() => undefined)}
        />
      )}
    />
  );
}
