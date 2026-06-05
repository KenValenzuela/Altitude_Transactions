import {DEADLINE_SOURCE_CHANGES, WORKFLOW_PREVIEW_DOCUMENTS} from '@/lib/document-workflow';

export function DeadlineIntelligenceSection() {
  const amendments = WORKFLOW_PREVIEW_DOCUMENTS.filter((doc) => doc.documentName === 'Amend / Extend Contract');

  return (
    <section className="lp-section lp-section--navy" aria-labelledby="deadline-heading">
      <div className="lp-section-inner lp-split">
        <div>
          <p className="lp-section-eyebrow alt-eyebrow lp-on-dark">Deadline intelligence</p>
          <h2 id="deadline-heading" className="lp-section-h2 lp-section-h2--white">Amend / Extend approvals update deadlines without hiding provenance.</h2>
          <p className="lp-section-copy lp-copy-on-dark">
            Colorado transactions can have repeated Amend / Extend documents — commonly up to 6–8 per file. Altitude sequences each upload, routes it through review, and only updates broker deadline tracking after approval.
          </p>
          <p className="lp-section-copy lp-copy-on-dark">
            Approved documents become the current source of truth, while prior values stay traceable by previous value, new value, source document, uploaded date, approved by, and approved date.
          </p>
        </div>
        <div className="lp-provenance-card">
          <div className="lp-amend-stack">
            {amendments.map((doc) => (
              <div key={doc.id}>
                <strong>Amend / Extend #{doc.sequenceNumber}</strong>
                <span>{doc.workflowStatus.replaceAll('_', ' ')} · {doc.fileName}</span>
              </div>
            ))}
          </div>
          <div className="lp-provenance-table">
            {DEADLINE_SOURCE_CHANGES.map((change) => (
              <div key={change.id} className="lp-provenance-row">
                <strong>{change.name}</strong>
                <span>{change.previousDate ?? '—'} → {change.date}</span>
                <em>{change.sourceDocumentName} · {change.reviewStatus}</em>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
