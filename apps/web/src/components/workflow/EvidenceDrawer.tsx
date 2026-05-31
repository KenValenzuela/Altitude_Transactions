import type { ExtractedField } from '@/types/domain';
import { FieldStatusBadge } from './FieldStatusBadge';

function ConfidenceBar({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const tier = confidence >= 0.85 ? 'high' : confidence >= 0.65 ? 'medium' : 'low';
  return (
    <div className="evidence-drawer__confidence">
      <div className="confidence-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${pct}% confidence`}>
        <div className={`confidence-bar__fill confidence-bar__fill--${tier}`} style={{ width: `${pct}%` }} />
      </div>
      <span style={{ fontSize: '.8rem', fontWeight: 700, color: tier === 'high' ? 'var(--alt-success)' : tier === 'medium' ? 'var(--alt-warning)' : 'var(--alt-danger)', flexShrink: 0 }}>
        {pct}%
      </span>
    </div>
  );
}

export function EvidenceDrawer({ field }: { field?: ExtractedField }) {
  if (!field) {
    return (
      <aside className="evidence-drawer" aria-label="Field evidence panel">
        <div className="evidence-drawer__empty">
          <div>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: 'var(--alt-border-strong)', margin: '0 auto .75rem', display: 'block' }}>
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <path d="M8 7h8M8 11h5M8 15h6"/>
            </svg>
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--alt-navy)', fontSize: '.9rem' }}>Select a field</p>
            <p style={{ margin: '.35rem 0 0', fontSize: '.82rem' }}>Choose a field to inspect its source evidence, confidence, and what to do next.</p>
          </div>
        </div>
      </aside>
    );
  }

  const displayVal = field.editedValue || (field.value && !field.value.startsWith('[REDACTED') ? field.value : null);
  const isNA = field.applicabilityStatus === 'not_applicable' || field.reviewDecision === 'marked_not_applicable';
  const isMissing = field.availabilityStatus === 'missing' || field.availabilityStatus === 'redacted';

  return (
    <aside className="evidence-drawer" aria-label={`Evidence for ${field.label}`}>
      <div className="evidence-drawer__header">
        <p className="eyebrow" style={{ margin: '0 0 .3rem' }}>Source evidence</p>
        <FieldStatusBadge field={field} />
      </div>

      <div className="evidence-drawer__body">
        <div>
          <h2 className="evidence-drawer__field-label">{field.label}</h2>
          <div className={`evidence-drawer__value-display${isMissing ? ' evidence-drawer__value-display--missing' : ''}`}>
            {isNA ? 'Not applicable per contract' :
             field.availabilityStatus === 'redacted' ? 'Redacted in source — enter manually' :
             field.availabilityStatus === 'missing' ? 'Not found in contract' :
             field.availabilityStatus === 'unreadable' ? 'Source area could not be read' :
             displayVal || '—'}
          </div>
        </div>

        {field.userFacingMessage ? (
          <div className="evidence-drawer__section">
            <div className="evidence-drawer__dt">About this field</div>
            <div className="evidence-drawer__message">{field.userFacingMessage}</div>
          </div>
        ) : null}

        {field.suggestedAction ? (
          <div className="evidence-drawer__section">
            <div className="evidence-drawer__dt">Suggested action</div>
            <div className="evidence-drawer__action">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2, color: 'var(--alt-info)' }}>
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
              </svg>
              <span>{field.suggestedAction}</span>
            </div>
          </div>
        ) : null}

        <div className="evidence-drawer__section">
          <div className="evidence-drawer__dt">Source</div>
          <div className="evidence-drawer__dd">
            {field.sourceSection || 'Section reference pending'}
            {field.sourcePage ? ` — page ${field.sourcePage}` : ''}
          </div>
        </div>

        {field.evidenceText && field.evidenceText !== field.userFacingMessage ? (
          <div className="evidence-drawer__section">
            <div className="evidence-drawer__dt">Evidence note</div>
            <div className="evidence-drawer__dd" style={{ fontStyle: 'italic' }}>{field.evidenceText}</div>
          </div>
        ) : null}

        <div className="evidence-drawer__section">
          <div className="evidence-drawer__dt">Extraction confidence</div>
          <ConfidenceBar confidence={field.confidence} />
          {field.confidence < 0.65 ? (
            <div style={{ fontSize: '.78rem', color: 'var(--alt-danger)', marginTop: '.3rem' }}>
              Low confidence — verify this value against the source document before approving.
            </div>
          ) : field.confidence < 0.85 ? (
            <div style={{ fontSize: '.78rem', color: 'var(--alt-warning)', marginTop: '.3rem' }}>
              Below normal confidence — check the source page before approving.
            </div>
          ) : null}
        </div>

        {field.requiredLevel ? (
          <div className="evidence-drawer__section">
            <div className="evidence-drawer__dt">Required for workspace</div>
            <div className="evidence-drawer__dd">
              {field.requiredLevel === 'required_to_create' ? 'Yes — must be resolved before creating the workspace' :
               field.requiredLevel === 'required_before_closing' ? 'Needed before closing (can add later)' :
               field.requiredLevel === 'optional' ? 'Optional — helpful but not required' :
               'Informational only'}
            </div>
          </div>
        ) : null}

        {field.originalValue && field.editedValue ? (
          <div className="evidence-drawer__section">
            <div className="evidence-drawer__dt">Original extracted value</div>
            <div className="evidence-drawer__dd" style={{ color: 'var(--alt-muted)', fontFamily: 'var(--f-mono)', fontSize: '.8rem' }}>
              {field.originalValue}
            </div>
          </div>
        ) : null}

        {field.extractionMethod ? (
          <div className="evidence-drawer__section">
            <div className="evidence-drawer__dt">Extraction method</div>
            <div className="evidence-drawer__dd" style={{ color: 'var(--alt-muted)' }}>
              {field.extractionMethod === 'fixture' ? 'Structured data extraction' :
               field.extractionMethod === 'human_corrected' ? 'Corrected by reviewer' :
               field.extractionMethod === 'deterministic' ? 'Deterministic field parser' :
               field.extractionMethod === 'llm' ? 'AI extraction' :
               field.extractionMethod}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
