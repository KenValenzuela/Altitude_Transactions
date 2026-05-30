import type { DocumentRequirement } from '@/types/domain';
import { StatusBadge } from './StatusBadge';

function documentTone(status?: string) {
  if (status === 'approved' || status === 'reviewed' || status === 'received') return 'success' as const;
  if (status === 'not_applicable') return 'neutral' as const;
  return 'warning' as const;
}

export function DocumentRequirementList({ documents }: { documents: DocumentRequirement[] }) {
  if (!documents.length) {
    return <p className="muted">No document requirements have been generated yet.</p>;
  }

  return (
    <ul className="list-stack" aria-label="Document requirements">
      {documents.map((document) => {
        const status = document.receivedStatus || document.state || 'missing';
        return (
          <li className="ops-row" key={document.id}>
            <div>
              <strong>{document.documentName || document.name}</strong>
              <p>{[document.category, document.purpose].filter(Boolean).join(' · ')}</p>
            </div>
            <StatusBadge label={status} tone={documentTone(status)} />
          </li>
        );
      })}
    </ul>
  );
}
