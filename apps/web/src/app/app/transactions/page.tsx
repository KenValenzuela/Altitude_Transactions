import Link from 'next/link';
import {activeTransactions} from '@/lib/product-data';
import {PageHeader, TransactionCard} from '@/components/product/ProductComponents';

export default function ActiveTransactionsPage() {
  const sorted = activeTransactions().sort((a, b) => ({critical: 0, high: 1, medium: 2, low: 3}[a.riskLevel] - {critical: 0, high: 1, medium: 2, low: 3}[b.riskLevel]));
  return <>
    <PageHeader eyebrow="Active Transactions" title="Active property transaction files" action={<Link className="at-btn at-btn-primary" href="/app/transactions/new">Upload New Contract</Link>}>Search, sort, filter, archive, and open property files. Default ordering prioritizes urgent work.</PageHeader>
    <div className="at-filterbar"><input placeholder="Search by property, buyer, seller, or agent" aria-label="Search Active Transactions"/><select aria-label="Filter by status"><option>All statuses</option><option>Under Contract</option><option>Closing Soon</option></select><select aria-label="Sort transactions"><option>Urgent work first</option><option>Closing date</option><option>Last updated</option></select></div>
    <div className="at-grid-2">{sorted.map((transaction) => <TransactionCard key={transaction.id} transaction={transaction}/>)}</div>
  </>;
}
