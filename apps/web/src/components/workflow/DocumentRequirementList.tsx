import type {DocumentRequirement} from '@/types/domain';

const CAT_LABEL: Record<string, string> = {
    purchase_contract: 'Purchase Contract',
    inspection_due_diligence: 'Inspection / Due Diligence',
    financing: 'Financing',
    title_escrow: 'Title & Escrow',
    closing: 'Closing',
    post_closing: 'Post-Closing',
    colorado_specific: 'Colorado-Specific',
    brokerage_compliance: 'Brokerage Compliance',
};

function statusDot(status: string) {
    if (status === 'approved' || status === 'reviewed' || status === 'received') {
        return {bg: 'var(--ok)', label: status};
    }
    if (status === 'not_applicable') {
        return {bg: 'var(--neutral)', label: 'N/A'};
    }
    return {bg: 'var(--warn)', label: status};
}

export function DocumentRequirementList({ documents }: { documents: DocumentRequirement[] }) {
  if (!documents.length) {
    return <p className="muted">No document requirements have been generated yet.</p>;
  }

    const byCategory: Record<string, DocumentRequirement[]> = {};
    for (const doc of documents) {
        const cat = doc.category || 'other';
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(doc);
    }

  return (
      <div className="dk-tasktable" aria-label="Document requirements">
          {Object.entries(byCategory).map(([cat, docs]) => (
              <div key={cat}>
                  <div className="dk-taskgroup-label" aria-hidden="true">
                      {CAT_LABEL[cat] ?? cat.replaceAll('_', ' ')}
                  </div>
                  <div className="dk-list">
                      {docs.map((doc) => {
                          const rawStatus = doc.receivedStatus || doc.state || 'missing';
                          const {bg, label} = statusDot(rawStatus);
                          return (
                              <div key={doc.id} className="dk-compactrow">
                  <span
                      className="dk-compactrow-dot"
                      style={{background: bg}}
                      aria-label={label}
                      title={label}
                  />
                                  <div className="dk-compactrow-body">
                                      <div className="dk-compactrow-title">{doc.documentName || doc.name}</div>
                                      {doc.purpose && (
                                          <div className="dk-compactrow-sub">{doc.purpose}</div>
                                      )}
                                  </div>
                                  <div className="dk-compactrow-right">
                    <span
                        className={`status-badge ${['approved', 'received', 'reviewed'].includes(rawStatus) ? 'success' : rawStatus === 'missing' ? 'warning' : 'neutral'}`}
                        style={{fontSize: 11}}
                    >
                      {label}
                    </span>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          ))}
      </div>
  );
}
