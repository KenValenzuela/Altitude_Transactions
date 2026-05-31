'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api-client';
import type { ExtractedField, ExtractionJob, ExtractionReviewSummary } from '@/types/domain';
import { AppShell } from '@/components/workflow/AppShell';
import { EmptyState } from '@/components/workflow/EmptyState';
import { ErrorState } from '@/components/workflow/ErrorState';
import { EvidenceDrawer } from '@/components/workflow/EvidenceDrawer';
import { ExtractionReviewTable } from '@/components/workflow/ExtractionReviewTable';
import { LoadingState } from '@/components/workflow/LoadingState';
import { PageHeader } from '@/components/workflow/PageHeader';
import { ReviewDecisionBar } from '@/components/workflow/ReviewDecisionBar';
import { ReviewSummary } from '@/components/workflow/ReviewSummary';
import { isCurrentlyBlocking } from '@/components/workflow/FieldStatusBadge';

function updateField(job: ExtractionJob, updated: ExtractedField): ExtractionJob {
  return { ...job, fields: job.fields.map((f) => (f.id === updated.id ? updated : f)) };
}

// Recomputes summary live from current field states so counts stay accurate after actions.
function computeLiveSummary(fields: ExtractedField[]): ExtractionReviewSummary {
  const blockingUnreviewed = fields.filter((f) => f.blocking && f.reviewDecision === 'unreviewed').length;
  const confirmedNa = fields.filter(
    (f) => f.applicabilityStatus === 'not_applicable' || f.reviewDecision === 'marked_not_applicable',
  ).length;
  const approved = fields.filter(
    (f) => f.reviewDecision === 'approved' || f.reviewDecision === 'edited' || f.reviewDecision === 'marked_unavailable',
  ).length;
  const missingExpected = fields.filter(
    (f) => f.availabilityStatus === 'missing' && f.reviewDecision === 'unreviewed',
  ).length;
  const lowConfidence = fields.filter(
    (f) => f.confidence < 0.85 && f.availabilityStatus === 'available' && f.reviewDecision === 'unreviewed',
  ).length;
  const conflicts = fields.filter((f) => Boolean(f.conflictOptions) && f.reviewDecision === 'unreviewed').length;
  const needsReview = fields.filter(
    (f) => f.reviewDecision === 'unreviewed' && f.applicabilityStatus !== 'not_applicable',
  ).length;
  return {
    total: fields.length,
    blockingUnreviewed,
    needsReview,
    confirmedNa,
    approved,
    missingExpected,
    lowConfidence,
    conflicts,
    canCreateTransaction: blockingUnreviewed === 0,
    estimatedReviewMinutes: Math.max(1, Math.round(needsReview * 0.75)),
  };
}

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
      // Auto-select first blocking field, or first unreviewed field
      const firstBlocking = nextJob.fields.find(isCurrentlyBlocking);
      const firstUnreviewed = nextJob.fields.find((f) => f.reviewDecision === 'unreviewed');
      setSelected(firstBlocking || firstUnreviewed || nextJob.fields[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load the review queue.');
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => { void loadJob(); }, [loadJob]);

  // Live summary recomputed from field states — stays accurate after every action.
  const liveSummary = useMemo(
    () => (job ? computeLiveSummary(job.fields) : undefined),
    [job],
  );

  async function handleApprove(field: ExtractedField) {
    try {
      const updated = await api.approveField(field.id);
      setJob((j) => j ? updateField(j, updated) : j);
      if (selected?.id === field.id) setSelected(updated);
    } catch { /* error shown on next submit */ }
  }

  async function handleEdit(field: ExtractedField, value: string) {
    try {
      const updated = await api.editField(field.id, value);
      setJob((j) => j ? updateField(j, updated) : j);
      if (selected?.id === field.id) setSelected(updated);
    } catch { /* error shown on next submit */ }
  }

  async function handleMarkNA(field: ExtractedField) {
    try {
      const updated = await api.markFieldNA(field.id);
      setJob((j) => j ? updateField(j, updated) : j);
      if (selected?.id === field.id) setSelected(updated);
    } catch { /* error shown on next submit */ }
  }

  async function handleMarkUnavailable(field: ExtractedField) {
    try {
      const updated = await api.markFieldUnavailable(field.id, 'Will provide before closing');
      setJob((j) => j ? updateField(j, updated) : j);
      if (selected?.id === field.id) setSelected(updated);
    } catch { /* error shown on next submit */ }
  }

  async function handleBulkApprove() {
    if (!job) return;
    // Snapshot the targets once so we don't chase a moving state reference.
    const targets = job.fields.filter(
      (f) => f.reviewDecision === 'unreviewed'
        && f.availabilityStatus === 'available'
        && f.confidence >= 0.85
        && f.applicabilityStatus !== 'not_applicable'
        && !f.blocking,
    );
    // Fire all requests in parallel for speed, then batch-update state once.
    const results = await Promise.allSettled(targets.map((f) => api.approveField(f.id)));
    const updated: ExtractedField[] = results
      .filter((r): r is PromiseFulfilledResult<ExtractedField> => r.status === 'fulfilled')
      .map((r) => r.value);
    if (updated.length > 0) {
      setJob((j) => {
        if (!j) return j;
        const map = new Map(updated.map((f) => [f.id, f]));
        return { ...j, fields: j.fields.map((f) => map.get(f.id) ?? f) };
      });
    }
  }

  async function handleCreate() {
    if (!job) return;
    setSubmitting(true);
    setError('');
    try {
      const detail = await api.confirmExtraction(job.id);
      router.push(`/transactions/${detail.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create the transaction workspace.');
      setSubmitting(false);
    }
  }

  const blockingCount = liveSummary?.blockingUnreviewed ?? 0;
  const totalFields = liveSummary?.total ?? 0;
  const confirmedNA = liveSummary?.confirmedNa ?? 0;

  const pageDescription = loading ? undefined :
    blockingCount > 0
      ? `Review ${blockingCount} required ${blockingCount === 1 ? 'item' : 'items'} before creating the transaction workspace. N/A fields are separated from missing information.`
      : liveSummary && liveSummary.needsReview > 0
        ? `Most fields were found. ${confirmedNA > 0 ? `${confirmedNA} field${confirmedNA > 1 ? 's are' : ' is'} confirmed N/A. ` : ''}Resolve the remaining items below, or create the workspace now and add details later.`
        : totalFields > 0
          ? 'All fields reviewed. Ready to create the transaction workspace.'
          : undefined;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Contract review"
        title="Review extracted contract details"
        description={pageDescription || 'Loading extraction results…'}
      />

      {error ? <ErrorState message={error} onRetry={loadJob} /> : null}
      {loading ? <LoadingState label="Loading extracted fields…" /> : null}

      {!loading && !error && job && job.fields.length === 0 ? (
        <EmptyState
          title="No fields extracted"
          message="The extraction completed but did not return any reviewable fields. This may indicate the PDF could not be parsed. Try uploading a cleaner version of the contract."
          actionHref="/upload"
          actionLabel="Upload again"
        />
      ) : null}

      {!loading && !error && job && job.fields.length > 0 ? (
        <>
          <ReviewSummary summary={liveSummary} fieldCount={job.fields.length} />

          <ReviewDecisionBar
            summary={liveSummary}
            onCreateWorkspace={handleCreate}
            onBulkApprove={handleBulkApprove}
            submitting={submitting}
            fieldCount={job.fields.length}
          />

          <div className="review-triage-layout">
            <ExtractionReviewTable
              fields={job.fields}
              onApprove={handleApprove}
              onEdit={handleEdit}
              onMarkNA={handleMarkNA}
              onMarkUnavailable={handleMarkUnavailable}
              onSelect={(f) => setSelected(f)}
              selectedFieldId={selected?.id}
            />
            <EvidenceDrawer field={selected} />
          </div>
        </>
      ) : null}
    </AppShell>
  );
}
