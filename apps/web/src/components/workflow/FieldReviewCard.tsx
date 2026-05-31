'use client';

import { useState } from 'react';
import type { ExtractedField } from '@/types/domain';
import { FieldStatusBadge, isCurrentlyBlocking } from './FieldStatusBadge';

interface FieldReviewCardProps {
  field: ExtractedField;
  selected?: boolean;
  onSelect?: (field: ExtractedField) => void;
  onApprove?: (field: ExtractedField) => void;
  onEdit?: (field: ExtractedField, value: string) => void;
  onMarkNA?: (field: ExtractedField) => void;
  onMarkUnavailable?: (field: ExtractedField) => void;
}

function cardClass(field: ExtractedField, selected: boolean): string {
  const classes = ['field-review-card'];
  if (selected) classes.push('field-review-card--selected');
  if (isCurrentlyBlocking(field)) classes.push('field-review-card--blocking');
  else if (field.reviewDecision === 'approved' || field.reviewDecision === 'edited') classes.push('field-review-card--approved');
  else if (field.applicabilityStatus === 'not_applicable' || field.reviewDecision === 'marked_not_applicable') classes.push('field-review-card--na');
  else if (field.availabilityStatus === 'missing' || field.confidence < 0.85) classes.push('field-review-card--warning');
  return classes.join(' ');
}

function displayValue(field: ExtractedField): string | null {
  if (field.editedValue) return field.editedValue;
  if (field.value && !field.value.startsWith('[REDACTED')) return field.value;
  return null;
}

const isResolved = (f: ExtractedField) =>
  f.reviewDecision !== 'unreviewed' || f.applicabilityStatus === 'not_applicable';

export function FieldReviewCard({
  field,
  selected = false,
  onSelect,
  onApprove,
  onEdit,
  onMarkNA,
  onMarkUnavailable,
}: FieldReviewCardProps) {
  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState(field.value || '');
  const resolved = isResolved(field);
  const val = displayValue(field);

  function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (editValue.trim()) {
      onEdit?.(field, editValue.trim());
      setEditMode(false);
    }
  }

  return (
    <article
      className={cardClass(field, selected)}
      aria-label={`Review field: ${field.label}`}
      onClick={() => onSelect?.(field)}
    >
      <div className="field-review-card__header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="field-review-card__label">{field.label}</div>
          {editMode ? null : (
            <div className={`field-review-card__value${val ? '' : ' field-review-card__value--missing'}`}>
              {val ?? (field.availabilityStatus === 'redacted' ? 'Redacted in source' : field.availabilityStatus === 'missing' ? 'Not found in contract' : '—')}
            </div>
          )}
        </div>
        <FieldStatusBadge field={field} />
      </div>

      {field.userFacingMessage && !resolved ? (
        <div className="field-review-card__message">{field.userFacingMessage}</div>
      ) : null}

      {field.sourceSection ? (
        <div className="field-review-card__source">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M4 4.5h4M4 6.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          {field.sourceSection}{field.sourcePage ? `, p.${field.sourcePage}` : ''}
        </div>
      ) : null}

      {editMode ? (
        <form onSubmit={handleEdit} onClick={(e) => e.stopPropagation()} style={{ display: 'grid', gap: '.4rem' }}>
          <input
            autoFocus
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            style={{
              border: '1px solid var(--alt-border-strong)',
              borderRadius: 'var(--r-sm)',
              padding: '.45rem .65rem',
              fontSize: '.88rem',
              width: '100%',
              minHeight: 38,
              fontFamily: 'inherit',
              background: 'white',
            }}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            aria-label={`Edit value for ${field.label}`}
          />
          <div style={{ display: 'flex', gap: '.4rem' }}>
            <button type="submit" className="field-action-btn field-action-btn--approve">Save edit</button>
            <button type="button" className="field-action-btn" onClick={(e) => { e.stopPropagation(); setEditMode(false); }}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="field-review-card__actions" onClick={(e) => e.stopPropagation()}>
          {!resolved ? (
            <>
              {field.availabilityStatus !== 'missing' && field.applicabilityStatus !== 'not_applicable' ? (
                <button
                  type="button"
                  className={`field-action-btn field-action-btn--approve${field.reviewDecision === 'approved' ? ' is-done' : ''}`}
                  onClick={() => onApprove?.(field)}
                  aria-label={`Approve ${field.label}`}
                >
                  {field.reviewDecision === 'approved' ? '✓ Approved' : 'Approve'}
                </button>
              ) : null}
              <button
                type="button"
                className="field-action-btn"
                onClick={() => { setEditValue(field.value || ''); setEditMode(true); }}
                aria-label={`Edit ${field.label}`}
              >
                {field.availabilityStatus === 'missing' ? 'Add value' : 'Edit'}
              </button>
              {field.applicabilityStatus !== 'not_applicable' ? (
                <button
                  type="button"
                  className="field-action-btn field-action-btn--na"
                  onClick={() => onMarkNA?.(field)}
                  aria-label={`Mark ${field.label} as not applicable`}
                >
                  Mark N/A
                </button>
              ) : null}
              {field.availabilityStatus === 'missing' || field.requiredLevel !== 'required_to_create' ? (
                <button
                  type="button"
                  className="field-action-btn"
                  style={{ color: 'var(--alt-muted)' }}
                  onClick={() => onMarkUnavailable?.(field)}
                  aria-label={`Mark ${field.label} as unavailable for now`}
                >
                  Get later
                </button>
              ) : null}
            </>
          ) : (
            <span style={{ fontSize: '.8rem', color: 'var(--alt-muted)' }}>
              {field.reviewDecision === 'marked_not_applicable' ? 'Confirmed N/A' :
               field.reviewDecision === 'marked_unavailable' ? 'Marked as unavailable' :
               field.reviewDecision === 'approved' ? 'Approved' :
               field.reviewDecision === 'edited' ? `Edited: ${field.editedValue}` :
               'Reviewed'}
            </span>
          )}
        </div>
      )}
    </article>
  );
}
