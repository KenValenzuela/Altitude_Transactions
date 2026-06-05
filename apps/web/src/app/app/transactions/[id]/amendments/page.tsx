import {getTransaction} from '@/lib/product-data';
import {PageHeader, StatusBadge} from '@/components/product/ProductComponents';

export default async function TransactionAmendments({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const transaction = getTransaction(id);
  return <><PageHeader eyebrow="Amendments" title="First-class amendment history">Amendments show original value versus proposed value, require approval, update current transaction values only after approval, and preserve original history.</PageHeader><div className="at-stack">{transaction.amendments.map((amendment) => <article className="at-card" key={amendment.id}><div className="at-section-head"><p className="at-kicker">Uploaded {amendment.uploadedAt}</p><h2>{amendment.name}</h2><StatusBadge status={amendment.status}/></div>{amendment.changes.map((change) => <div className="at-compare" key={change.field}><div><span>Field</span><strong>{change.field}</strong></div><div><span>Original</span><strong>{change.originalValue}</strong></div><div><span>Proposed / approved</span><strong>{change.approvedValue ?? change.proposedValue}</strong></div></div>)}<p>Approved by {amendment.approved_by ?? 'Pending'} at {amendment.approved_at ?? '—'}</p></article>)}</div></>;
}
