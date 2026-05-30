import type { ExtractedField } from '@/types/domain';

export function EvidenceDrawer({ field }: { field?: ExtractedField }) {
  if (!field) {
    return (
      <aside className="ops-card evidence-card" aria-label="Selected field evidence">
        <p className="eyebrow">Evidence</p>
        <h2>Select a field</h2>
        <p>Choose a review row to inspect source page, section, confidence, and status.</p>
      </aside>
    );
  }

  return (
    <aside className="ops-card evidence-card" aria-label={`Evidence for ${field.label}`}>
      <p className="eyebrow">Source-backed evidence</p>
      <h2>{field.label}</h2>
      <dl>
        <div>
          <dt>Value</dt>
          <dd>{field.value || 'Not found'}</dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>
            Document {field.sourceDocumentId}, page {field.sourcePage || '—'}
          </dd>
        </div>
        <div>
          <dt>Section</dt>
          <dd>{field.sourceSection || 'Section pending'}</dd>
        </div>
        <div>
          <dt>Confidence</dt>
          <dd>{Math.round(field.confidence * 100)}%</dd>
        </div>
      </dl>
    </aside>
  );
}
