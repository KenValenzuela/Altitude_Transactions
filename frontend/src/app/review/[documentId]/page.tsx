'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api-client';
import { useApi } from '@/hooks/useApi';
import { useScreenNav } from '@/lib/navigation';
import { AppShell } from '@/components/ui/AppShell';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { ScreenReview } from '@/components/screens/ScreenReview';

export default function ReviewPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const router = useRouter();
  const go = useScreenNav();
  const { data: job, loading, error, refresh } = useApi(() => api.getExtraction(documentId), [documentId]);
  const [busy, setBusy] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const onConfirm = async () => {
    if (!job) return;
    setBusy(true);
    setConfirmError(null);
    try {
      const detail = await api.confirmExtraction(job.id);
      router.push(`/transactions/${detail.id}`);
    } catch (err) {
      setConfirmError(err instanceof ApiError ? err.message : 'Could not build the transaction.');
      setBusy(false);
    }
  };

  return (
    <AppShell>
      {loading ? (
        <LoadingState label="Loading extraction…" />
      ) : error || !job ? (
        <ErrorState message={error ?? 'Extraction not found.'} onRetry={refresh} />
      ) : confirmError ? (
        <ErrorState message={confirmError} onRetry={() => setConfirmError(null)} />
      ) : (
        <ScreenReview go={go} job={job} onConfirm={onConfirm} busy={busy} />
      )}
    </AppShell>
  );
}
