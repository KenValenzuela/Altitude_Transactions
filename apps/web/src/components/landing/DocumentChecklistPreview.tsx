import {DOCUMENT_TEMPLATES, WORKFLOW_PREVIEW_DOCUMENTS} from '@/lib/document-workflow';

export function DocumentChecklistPreview() {
  const previewRows = DOCUMENT_TEMPLATES.slice(0, 10).map((template) => {
    const doc = WORKFLOW_PREVIEW_DOCUMENTS.find((item) => item.templateId === template.id);
    return {template, doc};
  });

  return (
    <section className="lp-section lp-section--paper" aria-labelledby="checklist-heading">
      <div className="lp-section-inner lp-split">
        <div>
          <p className="lp-section-eyebrow alt-eyebrow">Click-to-complete checklist</p>
          <h2 id="checklist-heading" className="lp-section-h2">Colorado document checklist as the source of truth.</h2>
          <p className="lp-section-copy">
            Altitude’s transaction workspace is organized around the real Colorado residential document checklist. Rows track document name, status, Needed/N/A, uploaded file, review state, approval state, and source history — without extra explanatory columns Brett does not need.
          </p>
          <p className="lp-section-copy">
            Almost every line in Brett’s click-to-complete chart is required by default or configurable per transaction, including custom rows for contractor invoices and vendor documents.
          </p>
        </div>
        <div className="lp-checklist-card">
          <div className="lp-card-title-row">
            <h3>Purchase Contract Documents</h3>
            <button type="button" className="lp-mini-admin">+ Add row</button>
          </div>
          <div className="lp-checklist-table" aria-label="Purchase contract document checklist preview">
            {previewRows.map(({template, doc}) => (
              <div key={template.id} className="lp-checklist-row">
                <div>
                  <strong>{template.documentName}</strong>
                  <span>{doc?.fileName ?? 'No file uploaded yet'}</span>
                </div>
                <div className="lp-needed-toggle" aria-label={`${template.documentName} needed state`}>
                  <span className={doc?.neededState !== 'not_applicable' ? 'on' : ''}>Needed</span>
                  <span className={doc?.neededState === 'not_applicable' ? 'on muted' : ''}>N/A</span>
                </div>
                <em>{doc?.workflowStatus.replaceAll('_', ' ') ?? 'missing'}</em>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
