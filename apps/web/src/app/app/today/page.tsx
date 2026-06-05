import Link from 'next/link';
import {allDocuments, activeTransactions, allTransactionAlerts, needingReview, transactions, urgentDeadlines} from '@/lib/product-data';
import {Metric, PageHeader, StatusBadge, TransactionCard} from '@/components/product/ProductComponents';

export default function TodayPage() {
  const review = needingReview();
  const deadlines = urgentDeadlines();
  const recent = allDocuments().sort((a, b) => b.document.lastUpdated.localeCompare(a.document.lastUpdated)).slice(0, 4);
  const tasksDueToday = transactions.flatMap((transaction) => transaction.tasks.filter((task) => task.dueDate === '2026-06-05').map((task) => ({transaction, task})));
  const missing = allDocuments().filter(({document}) => document.status === 'upload_needed');
  return <>
    <PageHeader eyebrow="Today" title="What Brett needs to handle today">Documents, deadlines, tasks, amendments, and missing requirements are organized by transaction file so the next action is obvious.</PageHeader>
    <div className="at-card-grid-4"><Metric label="Needs review" value={review.length}/><Metric label="Deadline risk" value={deadlines.length}/><Metric label="Tasks due today" value={tasksDueToday.length}/><Metric label="Missing required docs" value={missing.length}/></div>
    <section className="at-grid-2">
      <div className="at-card"><div className="at-section-head"><p className="at-kicker">Review queue</p><h2>Documents and AI-assisted changes</h2></div>{review.map((item) => <Link className="at-list-line" key={`${item.transaction.id}-${item.label}`} href={`/app/transactions/${item.transaction.id}/review`}><strong>{item.label}</strong><span>{item.type} · {item.transaction.propertyAddress.split(',')[0]}</span></Link>)}</div>
      <div className="at-card"><div className="at-section-head"><p className="at-kicker">Due soon / overdue</p><h2>Critical dates</h2></div>{deadlines.map(({transaction, deadline}) => <Link className="at-list-line" key={`${transaction.id}-${deadline.id}`} href={`/app/transactions/${transaction.id}/deadlines`}><strong>{deadline.name}</strong><span>{deadline.current_date} · {transaction.propertyAddress.split(',')[0]}</span><StatusBadge status={deadline.status}/></Link>)}</div>
      <div className="at-card"><div className="at-section-head"><p className="at-kicker">Today</p><h2>Tasks due today</h2></div>{tasksDueToday.map(({transaction, task}) => <Link className="at-list-line" key={task.id} href={`/app/transactions/${transaction.id}/tasks`}><strong>{task.title}</strong><span>{transaction.propertyAddress.split(',')[0]} · {task.owner}</span><StatusBadge status={task.status}/></Link>)}</div>
      <div className="at-card"><div className="at-section-head"><p className="at-kicker">Supporting panel</p><h2>Recently uploaded files</h2></div>{recent.map(({transaction, document}) => <Link className="at-list-line" key={document.id} href={`/app/transactions/${transaction.id}/documents`}><strong>{document.name}</strong><span>{document.lastUpdated} · {document.uploadedBy ?? 'No uploader yet'}</span></Link>)}</div>
    </section>
    <section><div className="at-section-head"><p className="at-kicker">Active transaction alerts</p><h2>Property files requiring attention</h2></div><div className="at-grid-2">{activeTransactions().map((transaction) => <TransactionCard key={transaction.id} transaction={transaction}/>)}</div></section>
    <section className="at-card"><div className="at-section-head"><p className="at-kicker">Alerts</p><h2>Open transaction notes</h2></div>{allTransactionAlerts().map(({transaction, note}) => <Link className="at-list-line" key={`${transaction.id}-${note}`} href={`/app/transactions/${transaction.id}`}><strong>{note}</strong><span>{transaction.propertyAddress}</span></Link>)}</section>
  </>;
}
