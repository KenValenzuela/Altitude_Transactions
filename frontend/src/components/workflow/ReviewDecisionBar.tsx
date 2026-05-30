import type { ExtractionReviewSummary } from '@/types/domain';
import { Button } from './Button';

interface ReviewDecisionBarProps {
  summary?: ExtractionReviewSummary;
  onCreateWorkspace: () => void;
  onBulkApprove?: () => void;
  submitting?: boolean;
  fieldCount: number;
}

export function ReviewDecisionBar({
  summary,
  onCreateWorkspace,
  onBulkApprove,
  submitting = false,
  fieldCount,
}: ReviewDecisionBarProps) {
  const canCreate = summary?.canCreateTransaction ?? true;
  const blocking = summary?.blockingUnreviewed ?? 0;
  const needsReview = summary?.needsReview ?? 0;

  let headline: string;
  let sub: string;

  if (blocking > 0) {
    headline = `${blocking} required ${blocking === 1 ? 'field needs' : 'fields need'} your attention before creating the workspace.`;
    sub = 'Review the items flagged in red below.';
  } else if (needsReview > 0) {
    headline = `${needsReview} ${needsReview === 1 ? 'field is' : 'fields are'} still unreviewed — workspace can be created now.`;
    sub = 'Unreviewed optional fields can be completed later.';
  } else {
    headline = 'All fields reviewed. Ready to create the transaction workspace.';
    sub = '';
  }

  return (
    <div className="review-decision-bar" role="status" aria-live="polite">
      <div className="review-decision-bar__progress">
        <div className="review-decision-bar__text">
          <div className="review-decision-bar__headline">{headline}</div>
          {sub ? <div className="review-decision-bar__sub">{sub}</div> : null}
        </div>
      </div>
      <div className="review-decision-bar__actions">
        {onBulkApprove && needsReview > 0 ? (
          <button
            type="button"
            className="ops-button ops-button--secondary"
            onClick={onBulkApprove}
            style={{ fontSize: '.82rem', padding: '.55rem .9rem', minHeight: 40 }}
          >
            Approve high-confidence
          </button>
        ) : null}
        <Button
          variant={canCreate ? 'gold' : 'secondary'}
          disabled={!canCreate || submitting}
          onClick={onCreateWorkspace}
        >
          {submitting ? 'Building workspace…' : canCreate ? 'Create transaction workspace' : `Resolve ${blocking} required ${blocking === 1 ? 'field' : 'fields'} first`}
        </Button>
      </div>
    </div>
  );
}
