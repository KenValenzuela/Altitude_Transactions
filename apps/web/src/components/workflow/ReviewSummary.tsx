import type { ExtractionReviewSummary } from '@/types/domain';

interface StatProps {
  label: string;
  value: number;
  sub?: string;
  variant?: 'default' | 'blocking' | 'warning' | 'success' | 'muted';
}

function Stat({ label, value, sub, variant = 'default' }: StatProps) {
  const valueClass = {
    default: '',
    blocking: 'review-summary__value--blocking',
    warning: 'review-summary__value--warning',
    success: 'review-summary__value--success',
    muted: 'review-summary__value--muted',
  }[variant];

  const cardClass = variant === 'blocking'
    ? 'review-summary__stat review-summary__stat--blocking'
    : variant === 'success'
      ? 'review-summary__stat review-summary__stat--ready'
      : 'review-summary__stat';

  return (
    <div className={cardClass}>
      <span className="review-summary__label">{label}</span>
      <span className={`review-summary__value ${valueClass}`}>{value}</span>
      {sub ? <span className="review-summary__sub">{sub}</span> : null}
    </div>
  );
}

export function ReviewSummary({ summary, fieldCount }: { summary?: ExtractionReviewSummary; fieldCount: number }) {
  if (!summary) {
    return (
      <div className="review-summary">
        <Stat label="Fields" value={fieldCount} sub="Extracted from the contract" />
      </div>
    );
  }

  const blockingLabel = summary.blockingUnreviewed === 0
    ? 'All blocking fields resolved'
    : summary.blockingUnreviewed === 1
      ? '1 field must be reviewed'
      : `${summary.blockingUnreviewed} fields must be reviewed`;

  return (
    <div className="review-summary" role="region" aria-label="Review progress summary">
      <Stat
        label="Must review"
        value={summary.blockingUnreviewed}
        sub={blockingLabel}
        variant={summary.blockingUnreviewed > 0 ? 'blocking' : 'success'}
      />
      <Stat
        label="Needs review"
        value={summary.needsReview}
        sub="Still unreviewed"
        variant={summary.needsReview > 0 ? 'warning' : 'muted'}
      />
      <Stat
        label="Approved"
        value={summary.approved}
        sub="Fields confirmed"
        variant={summary.approved > 0 ? 'success' : 'muted'}
      />
      <Stat
        label="Confirmed N/A"
        value={summary.confirmedNa}
        sub="Not applicable per contract"
        variant="muted"
      />
      {summary.lowConfidence > 0 ? (
        <Stat
          label="Low confidence"
          value={summary.lowConfidence}
          sub="Review carefully"
          variant="warning"
        />
      ) : null}
      {summary.missingExpected > 0 ? (
        <Stat
          label="Missing info"
          value={summary.missingExpected}
          sub="Not found in contract"
          variant="warning"
        />
      ) : null}
    </div>
  );
}
