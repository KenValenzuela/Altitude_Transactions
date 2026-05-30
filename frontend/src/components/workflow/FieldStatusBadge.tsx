import type { ExtractedField } from '@/types/domain';

type BadgeTone = 'blocking' | 'warning' | 'info' | 'success' | 'neutral' | 'muted';

interface StatusConfig {
  label: string;
  tone: BadgeTone;
}

export function getFieldStatusConfig(field: ExtractedField): StatusConfig {
  const { reviewDecision, availabilityStatus, applicabilityStatus, requiredLevel, confidence, conflictOptions } = field;

  // Resolved decisions take highest priority
  if (reviewDecision === 'approved') return { label: 'Approved', tone: 'success' };
  if (reviewDecision === 'edited') return { label: 'Edited', tone: 'success' };
  if (reviewDecision === 'marked_not_applicable') return { label: 'Confirmed N/A', tone: 'muted' };
  if (reviewDecision === 'marked_unavailable') return { label: 'Unavailable', tone: 'muted' };
  if (reviewDecision === 'rejected') return { label: 'Rejected', tone: 'neutral' };

  // Auto-resolved states (from fixture — N/A or completed per contract)
  if (applicabilityStatus === 'not_applicable') return { label: 'Confirmed N/A', tone: 'muted' };

  // Unreviewed — classify by what the system found
  if (conflictOptions) return { label: 'Conflict', tone: 'blocking' };

  if (availabilityStatus === 'redacted') {
    return requiredLevel === 'required_to_create'
      ? { label: 'Redacted — enter manually', tone: 'blocking' }
      : { label: 'Redacted in source', tone: 'warning' };
  }

  if (availabilityStatus === 'unreadable') return { label: "Couldn't read source", tone: 'warning' };

  if (availabilityStatus === 'missing') {
    return requiredLevel === 'required_to_create'
      ? { label: 'Missing — required', tone: 'blocking' }
      : requiredLevel === 'required_before_closing'
        ? { label: 'Missing — add before closing', tone: 'warning' }
        : { label: 'Missing', tone: 'warning' };
  }

  if (confidence < 0.65) return { label: 'Low confidence', tone: 'blocking' };
  if (confidence < 0.85) return { label: 'Needs confirmation', tone: 'warning' };

  return { label: 'Ready to approve', tone: 'info' };
}

export function isCurrentlyBlocking(field: ExtractedField): boolean {
  if (!field.blocking) return false;
  return field.reviewDecision === 'unreviewed';
}

export function FieldStatusBadge({ field }: { field: ExtractedField }) {
  const { label, tone } = getFieldStatusConfig(field);
  return (
    <span className={`field-status-badge field-status-badge--${tone}`}>
      {label}
    </span>
  );
}
