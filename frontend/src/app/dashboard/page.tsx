'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api-client';
import type { TransactionCard as TransactionCardType } from '@/types/domain';
import { AppShell } from '@/components/workflow/AppShell';
import { DeadlineAlert } from '@/components/workflow/DeadlineAlert';
import { EmptyState } from '@/components/workflow/EmptyState';
import { ErrorState } from '@/components/workflow/ErrorState';
import { LoadingState } from '@/components/workflow/LoadingState';
import { MetricCard } from '@/components/workflow/MetricCard';
import { PageHeader } from '@/components/workflow/PageHeader';
import { SectionHeader } from '@/components/workflow/SectionHeader';
import { TransactionCard } from '@/components/workflow/TransactionCard';

export default function DashboardPage() {
  const [cards, setCards] = useState<TransactionCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setCards(await api.listTransactions());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load transactions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const summary = useMemo(() => {
    const averageProgress = cards.length ? Math.round((cards.reduce((sum, card) => sum + card.progress, 0) / cards.length) * 100) : 0;
    return {
      activeFiles: cards.length,
      atRisk: cards.filter((card) => card.urgent).length,
      averageProgress,
      nextDeadline: cards[0]?.next,
    };
  }, [cards]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Operations cockpit"
        title="Today’s Colorado transactions"
        description="Prioritize active files, review upcoming contract deadlines, and continue source-backed intake."
        actions={
          <Link className="ops-button ops-button--primary" href="/upload">
            Upload CTME PDF
          </Link>
        }
      />

      {error ? <ErrorState message={error} onRetry={loadTransactions} /> : null}
      {loading ? <LoadingState label="Loading transactions…" /> : null}

      {!loading && !error && cards.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          message="Upload a CTME contract to create the first transaction workspace."
          actionHref="/upload"
          actionLabel="Upload CTME PDF"
        />
      ) : null}

      {!loading && !error && cards.length > 0 ? (
        <>
          <DeadlineAlert
            deadline={{
              id: 'next-deadline-summary',
              transactionId: cards[0].id,
              eventName: summary.nextDeadline || 'Review extracted fields',
              applicability: 'active',
              sourceDocumentId: 'dashboard-summary',
              createdAt: new Date().toISOString(),
            }}
          />

          <section className="metric-grid" aria-label="Dashboard summary">
            <MetricCard label="Active files" value={summary.activeFiles} detail="Open transaction workspaces" />
            <MetricCard label="At risk" value={summary.atRisk} detail="Files with urgent next steps" />
            <MetricCard label="Average progress" value={`${summary.averageProgress}%`} detail="Based on generated task completion" />
          </section>

          <section aria-labelledby="active-transactions-title">
            <SectionHeader
              eyebrow="Transaction queue"
              title="Active files"
              id="active-transactions-title"
              description="Open a workspace to review fields, deadlines, tasks, contacts, documents, and activity."
            />
            <div className="card-grid">
              {cards.map((card) => (
                <TransactionCard key={card.id} transaction={card} />
              ))}
            </div>
          </section>
        </>
      ) : null}
    </AppShell>
  );
}
