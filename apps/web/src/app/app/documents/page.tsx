import Link from 'next/link';
import {allDocuments} from '@/lib/product-data';
import {PageHeader, StatusBadge} from '@/components/product/ProductComponents';

export default function DocumentsPage() {
  return <><PageHeader eyebrow="Documents" title="Global document visibility">Use this page to find documents across transactions. Transaction-specific document management happens inside the transaction workspace.</PageHeader><div className="at-filterbar"><input placeholder="Search documents" aria-label="Search Documents"/><select aria-label="Filter by status"><option>All statuses</option><option>Needs Review</option><option>Approved</option><option>Not Applicable</option></select><select aria-label="Filter by document type"><option>All document types</option><option>Contract</option><option>Disclosure</option><option>Title</option></select></div><div className="at-table-card"><div className="at-table-head at-documents-grid"><span>Document</span><span>Transaction</span><span>Status</span><span>Updated</span></div>{allDocuments().map(({transaction, document}) => <Link key={`${transaction.id}-${document.id}`} className="at-table-row at-documents-grid" href={`/app/transactions/${transaction.id}/documents`}><strong>{document.name}</strong><span>{transaction.propertyAddress}</span><StatusBadge status={document.status}/><span>{document.lastUpdated}</span></Link>)}</div></>;
}
