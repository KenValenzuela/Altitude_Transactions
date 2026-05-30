'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api-client';
import type { ExtractedField, ExtractionJob } from '@/types/domain';
import { AppShell } from '@/components/workflow/AppShell';
import { Button } from '@/components/workflow/Button';
import { EmptyState } from '@/components/workflow/EmptyState';
import { ErrorState } from '@/components/workflow/ErrorState';
import { EvidenceDrawer } from '@/components/workflow/EvidenceDrawer';
import { ExtractionReviewTable } from '@/components/workflow/ExtractionReviewTable';
import { LoadingState } from '@/components/workflow/LoadingState';
import { MetricCard } from '@/components/workflow/MetricCard';
import { PageHeader } from '@/components/workflow/PageHeader';
import { SectionHeader } from '@/components/workflow/SectionHeader';

export default function ReviewPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const router = useRouter();
  const [job, setJob] = useState<ExtractionJob>();
  const [selected, setSelected] = useState<ExtractedField>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadJob = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const nextJob = await api.getExtraction(documentId);
      setJob(nextJob);
      setSelected(nextJob.fields[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load extraction review.');
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    void loadJob();
  }, [loadJob]);

  const reviewSummary = useMemo(() => {
    const fields = job?.fields ?? [];
    return {
      total: fields.length,
      approved: fields.filter((field) => field.reviewStatus === 'approved').length,
      needsReview: fields.filter((field) => field.reviewStatus !== 'approved').length,
    };
  }, [job]);

  async function approve(field: ExtractedField) {
    const updated = await api.approveField(field.id);
    setJob((currentJob) =>
      currentJob ? { ...currentJob, fields: currentJob.fields.map((item) => (item.id === field.id ? updated : item)) } : currentJob,
    );
    setSelected(updated);
  }

  async function submit() {
    if (!job) return;
    setSubmitting(true);
    try {
      const detail = await api.confirmExtraction(job.id);
      router.push(`/transactions/${detail.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to build transaction workspace.');
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Human review"
        title="Approve source-backed fields"
        description="Confirm extracted contract terms before Altitude generates the workspace. Field editing is supported by the API and remains a near-term UI task."
        actions={
          <Button onClick={submit} disabled={!job || submitting}>
            {submitting ? 'Building workspace…' : 'Build workspace'}
          </Button>
        }
      />

      {error ? <ErrorState message={error} onRetry={loadJob} /> : null}
      {loading ? <LoadingState label="Loading extracted fields…" /> : null}

      {!loading && !error && job && job.fields.length === 0 ? (
        <EmptyState title="No fields found" message="The extraction job completed but did not return reviewable fields." />
      ) : null}

      {!loading && !error && job && job.fields.length > 0 ? (
        <>
          <section className="metric-grid" aria-label="Review progress">
            <MetricCard label="Fields" value={reviewSummary.total} detail="Extracted from the source document" />
            <MetricCard label="Approved" value={reviewSummary.approved} detail="Confirmed by reviewer" />
            <MetricCard label="Needs review" value={reviewSummary.needsReview} detail="Pending approval or edit" />
          </section>

          <section aria-labelledby="review-table-title">
            <SectionHeader
              eyebrow="Review queue"
              title="Extracted contract fields"
              id="review-table-title"
              description="Select a row to inspect evidence, then approve source-backed values."
            />
            <div className="split-grid">
              <ExtractionReviewTable
                fields={job.fields}
                onApprove={approve}
                onSelect={setSelected}
                selectedFieldId={selected?.id}
              />
              <EvidenceDrawer field={selected} />
            </div>
          </section>
        </>
      ) : null}
    </AppShell>
  );
}
