'use client';

import { useState } from 'react';
import type { ExtractedField } from '@/types/domain';
import { FieldReviewCard } from './FieldReviewCard';
import { isCurrentlyBlocking } from './FieldStatusBadge';

interface TriageSectionProps {
  title: string;
  fields: ExtractedField[];
  defaultOpen?: boolean;
  countVariant?: 'blocking' | 'warning' | 'success' | 'neutral';
  onApprove?: (f: ExtractedField) => void;
  onEdit?: (f: ExtractedField, v: string) => void;
  onMarkNA?: (f: ExtractedField) => void;
  onMarkUnavailable?: (f: ExtractedField) => void;
  onSelect?: (f: ExtractedField) => void;
  selectedFieldId?: string;
  emptyMessage?: string;
}

function TriageSection({
  title, fields, defaultOpen = true, countVariant = 'neutral',
  onApprove, onEdit, onMarkNA, onMarkUnavailable, onSelect, selectedFieldId, emptyMessage,
}: TriageSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  if (!fields.length && !emptyMessage) return null;

  return (
    <div className="triage-section">
      <div
        className="triage-section__header"
        onClick={() => setOpen((v) => !v)}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((v) => !v); } }}
        aria-label={`${title} section, ${fields.length} fields`}
      >
        <span className="triage-section__title">{title}</span>
        <span className={`triage-section__count${countVariant !== 'neutral' ? ` triage-section__count--${countVariant}` : ''}`}>
          {fields.length}
        </span>
        <svg
          className={`triage-section__chevron${open ? ' triage-section__chevron--open' : ''}`}
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>

      {open && (
        <div className="triage-section__cards">
          {fields.length === 0 && emptyMessage ? (
            <p style={{ fontSize: '.85rem', color: 'var(--alt-muted)', padding: '.5rem 0' }}>{emptyMessage}</p>
          ) : fields.map((f) => (
            <FieldReviewCard
              key={f.id}
              field={f}
              selected={f.id === selectedFieldId}
              onSelect={onSelect}
              onApprove={onApprove}
              onEdit={onEdit}
              onMarkNA={onMarkNA}
              onMarkUnavailable={onMarkUnavailable}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ExtractionTriagePanelProps {
  fields: ExtractedField[];
  onApprove?: (field: ExtractedField) => void;
  onEdit?: (field: ExtractedField, value: string) => void;
  onMarkNA?: (field: ExtractedField) => void;
  onMarkUnavailable?: (field: ExtractedField) => void;
  onSelect?: (field: ExtractedField) => void;
  selectedFieldId?: string;
}

export function ExtractionReviewTable({
  fields, onApprove, onEdit, onMarkNA, onMarkUnavailable, onSelect, selectedFieldId,
}: ExtractionTriagePanelProps) {
  if (!fields.length) {
    return <p className="muted">No extracted fields are available for review.</p>;
  }

  const blocking = fields.filter((f) => isCurrentlyBlocking(f));
  const importantUnreviewed = fields.filter(
    (f) => !isCurrentlyBlocking(f)
      && f.reviewDecision === 'unreviewed'
      && f.applicabilityStatus !== 'not_applicable'
      && (f.requiredLevel === 'required_before_closing' || f.availabilityStatus === 'missing')
  );
  const readyToApprove = fields.filter(
    (f) => !isCurrentlyBlocking(f)
      && f.reviewDecision === 'unreviewed'
      && f.applicabilityStatus !== 'not_applicable'
      && f.availabilityStatus === 'available'
      && f.confidence >= 0.85
      && f.requiredLevel !== 'required_before_closing'
  );
  const confirmedNA = fields.filter(
    (f) => f.applicabilityStatus === 'not_applicable' || f.reviewDecision === 'marked_not_applicable'
  );
  const approved = fields.filter(
    (f) => f.reviewDecision === 'approved' || f.reviewDecision === 'edited' || f.reviewDecision === 'marked_unavailable'
  );
  const rejected = fields.filter((f) => f.reviewDecision === 'rejected');

  const sharedProps = { onApprove, onEdit, onMarkNA, onMarkUnavailable, onSelect, selectedFieldId };

  return (
    <div className="review-triage-scroll" role="region" aria-label="Field review triage">
      <TriageSection
        title="Must review before creating workspace"
        fields={blocking}
        defaultOpen={true}
        countVariant="blocking"
        emptyMessage="No blocking fields — workspace can be created."
        {...sharedProps}
      />
      <TriageSection
        title="Important — needed before closing"
        fields={importantUnreviewed}
        defaultOpen={true}
        countVariant="warning"
        {...sharedProps}
      />
      <TriageSection
        title="Ready to approve"
        fields={readyToApprove}
        defaultOpen={blocking.length === 0}
        countVariant="neutral"
        {...sharedProps}
      />
      <TriageSection
        title="Confirmed N/A"
        fields={confirmedNA}
        defaultOpen={false}
        countVariant="neutral"
        {...sharedProps}
      />
      <TriageSection
        title="Approved"
        fields={approved}
        defaultOpen={false}
        countVariant="success"
        {...sharedProps}
      />
      {rejected.length > 0 ? (
        <TriageSection
          title="Rejected"
          fields={rejected}
          defaultOpen={false}
          countVariant="neutral"
          {...sharedProps}
        />
      ) : null}
    </div>
  );
}
