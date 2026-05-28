'use client';
import { useRouter } from 'next/navigation';
import { api, getStoredUser } from '@/lib/api-client';
import { useApi } from '@/hooks/useApi';
import { useScreenNav } from '@/lib/navigation';
import { DEMO_USER } from '@/lib/fixtures';
import { AppShell } from '@/components/ui/AppShell';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { ScreenDashboard } from '@/components/screens/ScreenDashboard';

export default function DashboardPage() {
  const router = useRouter();
  const go = useScreenNav();
  const { data, loading, error, refresh } = useApi(() => api.listTransactions(), []);
  const user = getStoredUser() ?? DEMO_USER;

  return (
    <AppShell>
      {loading ? (
        <LoadingState label="Loading your transactions…" />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <ScreenDashboard
          go={go}
          user={user}
          transactions={data ?? []}
          onOpen={(id) => router.push(`/transactions/${id}`)}
        />
      )}
    </AppShell>
  );
}
