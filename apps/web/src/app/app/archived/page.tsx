import {archivedTransactions} from '@/lib/product-data';
import {PageHeader, TransactionCard} from '@/components/product/ProductComponents';

export default function ArchivedTransactionsPage() {
  return <>
    <PageHeader eyebrow="Archived Transactions" title="Closed and inactive transaction files">Archived files remain searchable by address, buyer, seller, close date, agent, and status. Historical documents, deadlines, contacts, vendors, amendments, and audit records are preserved.</PageHeader>
    <div className="at-filterbar"><input placeholder="Search archived transaction history" aria-label="Search Archived Transactions"/><select aria-label="Archived status"><option>All archived statuses</option><option>Closed</option><option>Archived</option><option>Cancelled</option></select></div>
    <div className="at-grid-2">{archivedTransactions().map((transaction) => <TransactionCard key={transaction.id} transaction={transaction}/>)}</div>
  </>;
}
