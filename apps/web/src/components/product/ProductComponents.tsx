'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import type {ReactNode} from 'react';
import {activeTransactions, needingReview, statusLabels, transactions, urgentDeadlines, vendors} from '@/lib/product-data';
import type {AuditLogEntry, Contact, Deadline, DocumentChecklistItem, ReviewItem, Transaction, Vendor} from '@/lib/product-data';

const navItems = [
  { href: '/app/today', label: 'Today' },
  { href: '/app/transactions', label: 'Active Transactions' },
  { href: '/app/archived', label: 'Archived Transactions' },
  { href: '/app/deadlines', label: 'Deadlines' },
  { href: '/app/vendors', label: 'Vendor Rolodex' },
  { href: '/app/documents', label: 'Documents' },
  { href: '/app/audit', label: 'Audit Log' },
];

export function ProductAppShell({children}: {children: ReactNode}) {
  const pathname = usePathname();
  const deadlines = urgentDeadlines().slice(0, 5);
  const review = needingReview().slice(0, 4);
  return (
    <div className="at-shell">
      <aside className="at-left" aria-label="Application navigation">
        <Link className="at-brand" href="/app/today"><span>△</span><strong>Altitude Transactions</strong></Link>
        <nav className="at-nav">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'is-active' : ''}>{item.label}</Link>
          ))}
        </nav>
        <div className="at-sidebar-panel">
          <p className="at-kicker">Transaction Files</p>
          {activeTransactions().map((transaction) => (
            <Link key={transaction.id} href={`/app/transactions/${transaction.id}`} className="at-file-link">{transaction.propertyAddress.split(',')[0]}</Link>
          ))}
        </div>
        <div className="at-sidebar-panel at-secondary">
          <p className="at-kicker">Recent Files</p>
          <span>Title Commitment.pdf</span>
          <span>Seller Property Disclosure.pdf</span>
        </div>
      </aside>
      <div className="at-center">
        <header className="at-topbar">
          <div>
            <p className="at-kicker">Colorado residential contract-to-close</p>
            <strong>Premium transaction command center</strong>
          </div>
          <div className="at-top-actions">
            <Link className="at-btn at-btn-ghost" href="/app/settings/document-templates">Admin Templates</Link>
            <Link className="at-btn at-btn-primary" href="/app/transactions/new">Upload New Contract</Link>
          </div>
        </header>
        <main className="at-main" id="main-content">{children}</main>
      </div>
      <aside className="at-right" aria-label="Upcoming deadlines and review flags">
        <section className="at-card">
          <div className="at-section-head"><p className="at-kicker">Right now</p><h2>Deadline Risk</h2></div>
          <div className="at-stack">
            {deadlines.map(({transaction, deadline}) => <DeadlineMini key={`${transaction.id}-${deadline.id}`} deadline={deadline} transaction={transaction}/>) }
          </div>
        </section>
        <section className="at-card">
          <div className="at-section-head"><p className="at-kicker">Brett review</p><h2>Approval Queue</h2></div>
          <div className="at-stack">
            {review.map((item) => <Link key={`${item.transaction.id}-${item.label}`} href={`/app/transactions/${item.transaction.id}/review`} className="at-review-mini"><span>{item.type}</span><strong>{item.label}</strong><small>{item.transaction.propertyAddress.split(',')[0]}</small></Link>)}
          </div>
        </section>
      </aside>
    </div>
  );
}

function DeadlineMini({deadline, transaction}: {deadline: Deadline; transaction: Transaction}) {
  return <Link href={`/app/transactions/${transaction.id}/deadlines`} className={`at-deadline-mini risk-${deadline.riskLevel}`}><span>{statusLabels[deadline.status]}</span><strong>{deadline.name}</strong><small>{deadline.current_date} · {transaction.propertyAddress.split(',')[0]}</small></Link>;
}

export function PageHeader({eyebrow, title, children, action}: {eyebrow?: string; title: string; children?: ReactNode; action?: ReactNode}) {
  return <div className="at-page-head"><div>{eyebrow && <p className="at-kicker">{eyebrow}</p>}<h1>{title}</h1>{children && <p>{children}</p>}</div>{action}</div>;
}

export function StatusBadge({status}: {status: keyof typeof statusLabels | string}) {
  const label = status in statusLabels ? statusLabels[status as keyof typeof statusLabels] : titleCase(String(status).replaceAll('_', ' '));
  const tone = String(status).includes('overdue') || String(status).includes('rejected') || String(status).includes('upload_needed') ? 'risk' : String(status).includes('due_soon') || String(status).includes('needs') || String(status).includes('submitted') || String(status).includes('pending') ? 'warn' : String(status).includes('approved') || String(status).includes('completed') || String(status).includes('active') ? 'ok' : 'neutral';
  return <span className={`at-badge at-badge-${tone}`}>{label}</span>;
}

export function TransactionCard({transaction}: {transaction: Transaction}) {
  const missing = transaction.documents.filter((doc) => doc.status === 'upload_needed').length;
  const review = transaction.documents.filter((doc) => doc.status === 'needs_review' || doc.status === 'submitted').length + transaction.reviewItems.filter((item) => item.status === 'pending_review').length;
  const upcoming = transaction.deadlines.filter((deadline) => ['due_soon', 'overdue', 'upcoming', 'extended'].includes(deadline.status)).length;
  return <Link href={`/app/transactions/${transaction.id}`} className="at-transaction-card">
    <div><p className="at-kicker">Transaction File</p><h2>{transaction.propertyAddress}</h2><p>{transaction.buyer} buyer · {transaction.seller} seller</p></div>
    <div className="at-card-meta"><StatusBadge status={transaction.status}/><span>Closing {transaction.closingDate}</span><span>Risk: {transaction.riskLevel}</span></div>
    <div className="at-card-grid-3"><Metric label="Missing documents" value={missing}/><Metric label="Needs review" value={review}/><Metric label="Upcoming deadlines" value={upcoming}/></div>
    <small>Last updated {transaction.lastUpdated}</small>
  </Link>;
}

export function Metric({label, value}: {label: string; value: string | number}) {
  return <div className="at-metric"><strong>{value}</strong><span>{label}</span></div>;
}

export function TransactionTabs({id}: {id: string}) {
  const pathname = usePathname();
  const tabs = ['overview', 'documents', 'review', 'deadlines', 'tasks', 'contacts', 'vendors', 'financial', 'amendments', 'audit', 'post-close'];
  return <nav className="at-tabs" aria-label="Transaction workspace sections">{tabs.map((tab) => {
    const href = tab === 'overview' ? `/app/transactions/${id}/overview` : `/app/transactions/${id}/${tab}`;
    return <Link key={tab} href={href} className={pathname === href || (tab === 'overview' && pathname === `/app/transactions/${id}`) ? 'is-active' : ''}>{tab === 'post-close' ? 'Post-Close' : tab === 'audit' ? 'Audit Log' : titleCase(tab)}</Link>;
  })}</nav>;
}

export function TransactionHeader({transaction}: {transaction: Transaction}) {
  return <div className="at-transaction-header"><div><p className="at-kicker">Transaction File</p><h1>{transaction.propertyAddress}</h1><p>{transaction.buyer} buyer · {transaction.seller} seller · Contract {transaction.contractDate} · Closing {transaction.closingDate}</p></div><StatusBadge status={transaction.status}/></div>;
}

export function DocumentChecklist({documents}: {documents: DocumentChecklistItem[]}) {
  return <div className="at-table-card"><div className="at-table-head at-doc-grid"><span>Document needed</span><span>Status</span><span>Review / approval</span><span>Last touched</span><span>Actions</span></div>{documents.map((document) => <DocumentChecklistRow key={document.id} document={document}/>)}</div>;
}

function DocumentChecklistRow({document}: {document: DocumentChecklistItem}) {
  return <div className="at-table-row at-doc-grid"><div><strong>{document.name}</strong><p>{document.category} · {document.required ? 'Required' : 'Optional'} · {document.affectsDeadlines ? `Affects ${document.relatedDeadline ?? 'deadlines'}` : 'No deadline impact'}</p>{document.notes && <small>Note: {document.notes}</small>}</div><StatusBadge status={document.status}/><div><p>Uploaded by {document.uploadedBy ?? '—'}</p><p>Approved by {document.approvedBy ?? '—'}</p></div><span>{document.lastUpdated}</span><div className="at-row-actions"><button>Upload</button><button>Review</button><button>Approve</button><button>Mark N/A</button><button>Add note</button><button>Replace file</button></div></div>;
}

export function ReviewQueue({items}: {items: ReviewItem[]}) {
  return <div className="at-stack">{items.map((item) => <article key={item.id} className="at-card"><div className="at-section-head"><p className="at-kicker">{item.sourceDocument}</p><h2>{item.fieldName}</h2><StatusBadge status={item.status}/></div><div className="at-compare"><div><span>Current value</span><strong>{item.currentValue}</strong></div><div><span>Proposed value</span><strong>{item.proposedValue}</strong></div><div><span>Confidence</span><strong>{Math.round(item.confidence * 100)}%</strong></div></div><p>{item.note ?? 'AI-assisted extraction remains pending until Brett approves, rejects, or edits before approving.'}</p><div className="at-row-actions"><button>Approve</button><button>Reject</button><button>Edit before approving</button><button>Add note</button></div></article>)}</div>;
}

export function DeadlineList({deadlines}: {deadlines: Deadline[]}) {
  return <div className="at-grid-2">{deadlines.map((deadline) => <article key={deadline.id} className={`at-card risk-${deadline.riskLevel}`}><div className="at-section-head"><p className="at-kicker">{deadline.category}</p><h2>{deadline.name}</h2><StatusBadge status={deadline.status}/></div><dl className="at-dl"><div><dt>Original date</dt><dd>{deadline.original_date}</dd></div><div><dt>Current date</dt><dd>{deadline.current_date}</dd></div><div><dt>Responsible party</dt><dd>{deadline.responsibleParty}</dd></div>{deadline.changed_by_amendment_id && <div><dt>Amendment</dt><dd>{deadline.changed_by_amendment_id} · approved by {deadline.approved_by}</dd></div>}</dl><p>{deadline.notes}</p></article>)}</div>;
}

export function ContactList({contacts}: {contacts: Contact[]}) {
  return <div className="at-grid-2">{contacts.map((contact) => <article key={contact.id} className="at-card"><p className="at-kicker">{contact.required ? 'Default required contact' : contact.custom ? 'Custom contact' : 'Default optional contact'}</p><h2>{contact.label}</h2><p><strong>{contact.name}</strong>{contact.company ? ` · ${contact.company}` : ''}</p><p>{contact.email ?? 'No email yet'} · {contact.phone ?? 'No phone yet'}</p><div className="at-row-actions"><button>Edit</button>{contact.custom ? <button>Deactivate custom row</button> : <button>Add custom row</button>}</div></article>)}</div>;
}

export function VendorRolodex({items = vendors}: {items?: Vendor[]}) {
  return <div className="at-grid-2">{items.map((vendor) => <article key={vendor.id} className="at-card"><div className="at-section-head"><p className="at-kicker">{titleCase(vendor.category.replaceAll('_', ' '))}</p><h2>{vendor.name}</h2><StatusBadge status={vendor.active ? 'active' : 'archived'}/></div><p><strong>{vendor.company}</strong></p><p>{vendor.phone} · {vendor.email}</p><p>{vendor.notes}</p><small>Related transactions: {vendor.relatedTransactions.length || 'None'}</small><div className="at-row-actions"><button>Attach to transaction</button><button>{vendor.active ? 'Deactivate' : 'Reactivate'}</button></div></article>)}</div>;
}

export function AuditTimeline({items}: {items: AuditLogEntry[]}) {
  return <div className="at-timeline">{items.map((entry) => <article key={entry.id} className="at-timeline-item"><p className="at-kicker">{entry.timestamp} · {entry.user}</p><h2>{titleCase(entry.action.replaceAll('_', ' '))}</h2><p>{entry.entityType}: <strong>{entry.entityName}</strong></p><p>{entry.previousValue ? `Previous: ${entry.previousValue}. ` : ''}{entry.newValue ? `New: ${entry.newValue}.` : ''}</p><small>Source: {entry.source} · AI involved: {entry.aiInvolved ? 'yes' : 'no'} · Review required: {entry.reviewRequired ? 'yes' : 'no'}</small></article>)}</div>;
}

export function SummaryMetrics({transaction}: {transaction: Transaction}) {
  return <div className="at-card-grid-4"><Metric label="Missing documents" value={transaction.documents.filter((doc) => doc.status === 'upload_needed').length}/><Metric label="Needs review" value={transaction.documents.filter((doc) => doc.status === 'needs_review' || doc.status === 'submitted').length + transaction.reviewItems.filter((item) => item.status === 'pending_review').length}/><Metric label="Critical dates" value={transaction.deadlines.length}/><Metric label="Attached vendors" value={transaction.vendors.length}/></div>;
}

function titleCase(input: string) {
  return input.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
