'use client';

import type { ExtractedField } from '@/types/domain';
import { Button } from './Button';
import { StatusBadge } from './StatusBadge';

function populationTone(status: ExtractedField['populationStatus']) {
  if (status === 'not_applicable' || status === 'redacted_in_source') return 'neutral' as const;
  if (status === 'completed' || status === 'populated') return 'success' as const;
  if (status === 'missing_required' || status === 'needs_human_review') return 'warning' as const;
  return 'gold' as const;
}

export function ExtractedFieldRow({
  field,
  onApprove,
  onSelect,
  selected,
}: {
  field: ExtractedField;
  onApprove?: (field: ExtractedField) => void;
  onSelect?: (field: ExtractedField) => void;
  selected?: boolean;
}) {
  return (
    <tr className={selected ? 'is-selected' : undefined}>
      <th scope="row">
        <button className="table-row-button" type="button" onClick={() => onSelect?.(field)} aria-pressed={selected}>
          {field.label}
        </button>
      </th>
      <td>{field.value || '—'}</td>
      <td>{Math.round(field.confidence * 100)}%</td>
      <td>
        p.{field.sourcePage || '—'} · {field.sourceSection || 'Source pending'}
      </td>
      <td>
        <StatusBadge label={field.populationStatus} tone={populationTone(field.populationStatus)} />
      </td>
      <td>
        <Button onClick={() => onApprove?.(field)} variant={field.reviewStatus === 'approved' ? 'secondary' : 'primary'}>
          {field.reviewStatus === 'approved' ? 'Approved' : `Approve ${field.label}`}
        </Button>
      </td>
    </tr>
  );
}
