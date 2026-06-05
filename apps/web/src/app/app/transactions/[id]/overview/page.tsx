import Link from 'next/link';
import {getTransaction, vendors} from '@/lib/product-data';
import {AuditTimeline, DeadlineList, DocumentChecklist, SummaryMetrics} from '@/components/product/ProductComponents';

export default async function TransactionOverview({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const transaction = getTransaction(id);
  const attached = vendors.filter((vendor) => transaction.vendors.includes(vendor.id));
  return <div className="at-stack"><SummaryMetrics transaction={transaction}/><section className="at-card"><h2>Critical deadline summary</h2><DeadlineList deadlines={transaction.deadlines.slice(0, 2)}/></section><section className="at-card"><h2>Document checklist snapshot</h2><DocumentChecklist documents={transaction.documents}/></section><section className="at-grid-2"><div className="at-card"><h2>Contacts</h2>{transaction.contacts.slice(0, 5).map((contact) => <p key={contact.id}><strong>{contact.label}:</strong> {contact.name}</p>)}<Link href={`/app/transactions/${transaction.id}/contacts`}>Open contacts</Link></div><div className="at-card"><h2>Attached vendors</h2>{attached.map((vendor) => <p key={vendor.id}><strong>{vendor.company}</strong> · {vendor.name}</p>)}<Link href={`/app/transactions/${transaction.id}/vendors`}>Manage vendors</Link></div></section><section className="at-card"><h2>Recent audit history</h2><AuditTimeline items={transaction.audit.slice(0, 3)}/></section></div>;
}
