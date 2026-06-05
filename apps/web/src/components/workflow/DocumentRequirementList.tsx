import type {DocumentRequirement, DocumentWorkflowStatus, NeededState, TransactionDocument} from '@/types/domain';
import {DOCUMENT_STATUS_LABELS} from '@/lib/document-workflow';

const CAT_LABEL: Record<string, string> = {
  purchase_contract: 'Purchase Contract Documents',
  inspection_due_diligence: 'Inspection / Due Diligence',
  financing: 'Financing',
  title_escrow: 'Title & Escrow',
  closing: 'Closing',
  post_closing: 'Post-Closing',
  colorado_specific: 'Colorado-Specific',
  brokerage_compliance: 'Brokerage Compliance',
};

function workflowFromRequirement(doc: DocumentRequirement): DocumentWorkflowStatus {
  if (doc.receivedStatus === 'received') return 'uploaded';
  if (doc.receivedStatus === 'approved') return 'approved';
  if (doc.receivedStatus === 'reviewed') return 'reviewed';
  if (doc.state === 'superseded') return 'superseded';
  if (doc.state === 'ready_for_review') return 'ready_for_review';
  return 'missing';
}

function neededFromRequirement(doc: DocumentRequirement): NeededState {
  return doc.requiredStatus === 'not_applicable' || doc.state === 'na' ? 'not_applicable' : 'needed';
}

function toTransactionDocument(doc: DocumentRequirement): TransactionDocument {
  const workflowStatus = workflowFromRequirement(doc);
  return {
    id: doc.id,
    transactionId: doc.transactionId,
    templateId: doc.sourceDocumentId ? undefined : doc.id,
    documentName: doc.documentName || doc.name || 'Document',
    sectionName: CAT_LABEL[doc.category] ?? doc.category?.replaceAll('_', ' ') ?? 'Documents',
    neededState: neededFromRequirement(doc),
    workflowStatus,
    fileId: doc.sourceDocumentId,
    fileName: doc.sourceDocumentId ? `${doc.documentName}.pdf` : undefined,
    uploadCount: doc.sourceDocumentId ? 1 : 0,
    sequenceNumber: doc.sequenceNumber,
    uploadedAt: doc.uploadedAt,
    uploadedBy: doc.uploadedBy,
    reviewedAt: doc.reviewedAt,
    reviewedBy: doc.reviewedBy,
    approvedAt: doc.approvedAt,
    approvedBy: doc.approvedBy,
    supersedesDocumentId: doc.supersedesDocumentId,
    sourceNotes: doc.sourceNotes || doc.notes || doc.source,
  };
}

function badgeClass(status: DocumentWorkflowStatus, neededState: NeededState) {
  if (neededState === 'not_applicable') return 'neutral';
  if (status === 'approved') return 'success';
  if (status === 'reviewed' || status === 'ready_for_review' || status === 'uploaded') return 'info';
  if (status === 'superseded') return 'neutral';
  if (status === 'rejected') return 'danger';
  return 'warning';
}

function rowClass(status: DocumentWorkflowStatus, neededState: NeededState) {
  if (neededState === 'not_applicable') return 'dk-docflow-row--na';
  return `dk-docflow-row--${status}`;
}

function actionLabel(doc: TransactionDocument) {
  if (doc.neededState === 'not_applicable') return 'N/A';
  if (doc.workflowStatus === 'missing') return 'Upload Needed Document';
  if (doc.workflowStatus === 'uploaded' || doc.workflowStatus === 'ready_for_review') return 'Review';
  if (doc.workflowStatus === 'reviewed') return 'Approve';
  if (doc.workflowStatus === 'approved') return 'Complete';
  if (doc.workflowStatus === 'superseded') return 'Source history';
  return 'Resolve';
}

export function DocumentRequirementList({documents}: { documents: DocumentRequirement[] }) {
  if (!documents.length) {
    return (
      <div className="dk-docflow-empty">
        <strong>No document requirements yet.</strong>
        <p>Upload an executed contract to generate the Colorado checklist, or Brett/admin can add a manual document row.</p>
        <button type="button" className="dk-btn dk-secondary sm">+ Add document row</button>
      </div>
    );
  }

  const bySection: Record<string, TransactionDocument[]> = {};
  for (const requirement of documents) {
    const doc = toTransactionDocument(requirement);
    if (!bySection[doc.sectionName]) bySection[doc.sectionName] = [];
    bySection[doc.sectionName].push(doc);
  }

  return (
    <div className="dk-docflow" aria-label="Transaction document checklist">
      <div className="dk-docflow-toolbar">
        <div>
          <strong>Upload → Review → Approve</strong>
          <span>Needed/N/A controls affect completion calculations. N/A rows are excluded from required client-facing noise.</span>
        </div>
        <div className="dk-docflow-admin" aria-label="Admin-only controls preview">
          <button type="button">+ Add row</button>
          <button type="button">Move</button>
          <button type="button">Remove</button>
        </div>
      </div>

      {Object.entries(bySection).map(([section, docs]) => (
        <section key={section} className="dk-docflow-section" aria-labelledby={`doc-section-${section.replaceAll(' ', '-').toLowerCase()}`}>
          <div className="dk-taskgroup-label" id={`doc-section-${section.replaceAll(' ', '-').toLowerCase()}`}>{section}</div>
          <div className="dk-docflow-list">
            {docs.map((doc) => {
              const label = doc.neededState === 'not_applicable' ? 'N/A' : DOCUMENT_STATUS_LABELS[doc.workflowStatus];
              const sequencedName = doc.sequenceNumber ? `${doc.documentName} #${doc.sequenceNumber}` : doc.documentName;
              return (
                <article key={doc.id} className={`dk-docflow-row ${rowClass(doc.workflowStatus, doc.neededState)}`}>
                  <div className="dk-docflow-main">
                    <div className="dk-docflow-title-row">
                      <h3>{sequencedName}</h3>
                      <span className={`status-badge ${badgeClass(doc.workflowStatus, doc.neededState)}`}>{label}</span>
                    </div>
                    <div className="dk-docflow-meta">
                      {doc.fileName ? <span className="dk-file-chip">{doc.fileName}</span> : <span>Missing required upload</span>}
                      <span>{doc.sourceNotes || 'Source history will appear after upload/review.'}</span>
                    </div>
                  </div>
                  <div className="dk-docflow-actions">
                    <div className="dk-needed-toggle" aria-label={`${sequencedName} applicability`}>
                      <button type="button" className={doc.neededState === 'needed' ? 'on' : ''}>Needed</button>
                      <button type="button" className={doc.neededState === 'not_applicable' ? 'on' : ''}>N/A</button>
                    </div>
                    <button type="button" className="dk-btn dk-secondary sm">{actionLabel(doc)}</button>
                    <button type="button" className="dk-doc-history">History</button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
