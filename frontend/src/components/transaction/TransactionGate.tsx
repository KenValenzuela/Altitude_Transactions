'use client';
import type { ReactNode } from 'react';
import { api } from '@/lib/api-client';
import { useApi } from '@/hooks/useApi';
import { AppShell } from '@/components/ui/AppShell';
import { LoadingState, ErrorState } from '@/components/ui/States';
import type { TransactionDetail } from '@/types/api';

/**
 * Fetches a transaction's detail once and handles the loading / error states so
 * every workspace sub-screen (overview, checklist, deadlines, …) stays focused
 * on rendering. `refresh` is passed through for screens that mutate state.
 */
export function TransactionGate({
  id,
  render,
}: {
  id: string;
  render: (detail: TransactionDetail, refresh: () => void) => ReactNode;
}) {
  const { data, loading, error, refresh } = useApi(() => api.getTransaction(id), [id]);

  return (
    <AppShell>
      {loading ? (
        <LoadingState label="Opening transaction…" />
      ) : error || !data ? (
        <ErrorState message={error ?? 'Transaction not found.'} onRetry={refresh} />
      ) : (
        render(data, refresh)
      )}
    </AppShell>
  );
}
