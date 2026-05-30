'use client';

import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api-client';
import type { Task, Transaction } from '@/types/domain';
import { AppShell } from '@/components/workflow/AppShell';
import { AuditTimeline } from '@/components/workflow/AuditTimeline';
import { Button } from '@/components/workflow/Button';
import { Card } from '@/components/workflow/Card';
import { ContactMatrix } from '@/components/workflow/ContactMatrix';
import { DeadlineList } from '@/components/workflow/DeadlineList';
import { DocumentRequirementList } from '@/components/workflow/DocumentRequirementList';
import { EmptyState } from '@/components/workflow/EmptyState';
import { ErrorState } from '@/components/workflow/ErrorState';
import { ExtractionReviewTable } from '@/components/workflow/ExtractionReviewTable';
import { getNextTaskStatus } from '@/components/workflow/TaskStatusToggle';
import { LoadingState } from '@/components/workflow/LoadingState';
import { MetricCard } from '@/components/workflow/MetricCard';
import { PageHeader } from '@/components/workflow/PageHeader';
import { SectionHeader } from '@/components/workflow/SectionHeader';
import { StatusBadge } from '@/components/workflow/StatusBadge';
import { TaskChecklist } from '@/components/workflow/TaskChecklist';

function updateTaskInTransaction(transaction: Transaction, updatedTask: Task): Transaction {
  return {
    ...transaction,
    tasks: transaction.tasks.map((group) => ({
      ...group,
      items: group.items.map((task) => (task.id === updatedTask.id ? { ...task, ...updatedTask } : task)),
    })),
  };
}

export default function TransactionPage() {
  const { id } = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const loadTransaction = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setTransaction(await api.getTransaction(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load transaction workspace.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadTransaction();
  }, [loadTransaction]);

  const nextAction = useMemo(() => {
    const firstTask = transaction?.tasks.flatMap((group) => group.items).find((task) => task.status !== 'complete' && task.status !== 'not_applicable');
    return firstTask?.title || transaction?.deadlines[0]?.eventName || 'Review transaction activity';
  }, [transaction]);

  async function toggleTask(task: Task) {
    const nextStatus = getNextTaskStatus(task);
    setActionMessage(`Updating ${task.title}…`);
    try {
      const updated = await api.updateTask(task.id, nextStatus);
      setTransaction((current) => (current ? updateTaskInTransaction(current, updated) : current));
      setActionMessage(`${task.title} marked ${updated.status.replaceAll('_', ' ')}.`);
    } catch (err) {
      setActionMessage('');
      setError(err instanceof Error ? err.message : 'Unable to update task.');
    }
  }

  return (
    <AppShell>
      {loading ? <LoadingState label="Loading workspace…" /> : null}
      {error ? <ErrorState message={error} onRetry={loadTransaction} /> : null}
      {!loading && !error && !transaction ? <EmptyState title="Transaction not found" message="No workspace matched this route." /> : null}

      {!loading && !error && transaction ? (
        <>
          <PageHeader
            eyebrow="Transaction workspace"
            title={`${transaction.propertyAddress}, ${transaction.city}`}
            description="Operate review, deadlines, tasks, documents, contacts, and audit history from one source-backed workspace."
            actions={
              <>
                <StatusBadge label={transaction.status} tone="gold" />
                <StatusBadge label={`${transaction.riskLevel} risk`} tone={transaction.riskLevel === 'high' ? 'danger' : 'warning'} />
              </>
            }
          />

          <nav className="tab-nav" aria-label="Workspace sections">
            <ul>
              <li><a href="#review">Review</a></li>
              <li><a href="#deadlines">Deadlines</a></li>
              <li><a href="#tasks">Tasks</a></li>
              <li><a href="#contacts">Contacts</a></li>
              <li><a href="#documents">Documents</a></li>
              <li><a href="#activity">Activity</a></li>
            </ul>
          </nav>

          <section className="metric-grid" aria-label="Transaction summary">
            <MetricCard label="Purchase price" value={`$${transaction.money.price.toLocaleString()}`} />
            <MetricCard label="Earnest money" value={`$${transaction.money.earnest.toLocaleString()}`} />
            <MetricCard label="Closing" value={transaction.closingDate || '—'} detail={`${transaction.money.daysToClose} days`} />
            <MetricCard label="Completion" value={`${transaction.completionPercent}%`} detail="Backend transaction completion" />
          </section>

          <Card className="attention-card">
            <p className="eyebrow">Recommended next action</p>
            <h2>{nextAction}</h2>
            <p>Use the sections below to confirm extracted data, clear generated tasks, and keep contractual deadlines visible.</p>
            <Button variant="secondary" onClick={() => document.getElementById('tasks')?.scrollIntoView({ behavior: 'smooth' })}>
              Jump to tasks
            </Button>
          </Card>

          <div className="split-grid">
            <section id="review" aria-labelledby="review-title">
              <SectionHeader eyebrow="Source review" title="Extracted fields" id="review-title" description="Top extracted values with evidence references." />
              <ExtractionReviewTable fields={transaction.extractedFields.slice(0, 8)} />
            </section>

            <section id="tasks" aria-labelledby="tasks-title">
              <SectionHeader eyebrow="Generated operations" title="Tasks" id="tasks-title" description="Cycle task status as work progresses." />
              <div role="status" aria-live="polite" className="sr-status">
                {actionMessage}
              </div>
              <TaskChecklist groups={transaction.tasks} onToggle={toggleTask} />
            </section>
          </div>

          <section id="deadlines" aria-labelledby="deadlines-title">
            <SectionHeader eyebrow="Contract dates" title="Deadlines" id="deadlines-title" description="Generated from source-backed contract fields." />
            <DeadlineList deadlines={transaction.deadlines.slice(0, 10)} />
          </section>

          <section id="contacts" aria-labelledby="contacts-title">
            <SectionHeader eyebrow="People" title="Contacts" id="contacts-title" description="Extracted parties and required transaction contacts." />
            <ContactMatrix contacts={transaction.contacts} />
          </section>

          <section id="documents" aria-labelledby="documents-title">
            <SectionHeader eyebrow="File completeness" title="Document requirements" id="documents-title" description="Generated requirements and received status." />
            <DocumentRequirementList documents={transaction.documentRequirements} />
          </section>

          <section id="activity" aria-labelledby="activity-title">
            <SectionHeader eyebrow="Audit trail" title="Activity history" id="activity-title" description="Source, review, and task events recorded by the backend." />
            <AuditTimeline events={transaction.auditEvents} />
          </section>
        </>
      ) : null}
    </AppShell>
  );
}
