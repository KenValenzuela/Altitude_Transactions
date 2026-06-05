import Link from 'next/link';

const sections = [
  { eyebrow: 'Problem / Stakes', title: 'Missed deadlines and scattered documents create transaction risk.', body: 'Contract dates, disclosures, title items, inspection documents, contacts, and vendor work often live in separate inboxes and folders. Altitude makes the next required action visible.' },
  { eyebrow: 'How It Works', title: 'Upload, review, approve, track.', body: 'Upload a contract or transaction document, review AI-assisted extracted data, approve changes, and keep the property file synchronized with deadlines, contacts, tasks, documents, and audit history.' },
  { eyebrow: 'Transaction Command Center', title: 'Every property gets its own organized transaction file.', body: 'Open a property workspace with overview, documents, review queue, deadlines, tasks, contacts, vendors, financial, amendments, audit log, and post-close preservation.' },
  { eyebrow: 'AI-Assisted, Human-Approved', title: 'Automation supports Brett; it does not replace Brett.', body: 'AI can extract contract dates, deadlines, parties, and amendment changes, but nothing becomes authoritative until Brett/admin reviews and approves it.' },
  { eyebrow: 'Features', title: 'Documents, deadlines, contacts, vendors, amendments, and audit.', body: 'Checklist rows show what is missing, submitted, needs review, approved, rejected, needs revision, or not applicable. Deadline records preserve original date, current date, amendment source, and audit trail.' },
  { eyebrow: 'Service Tiers', title: 'Premium coordination options for different transaction volumes.', body: 'Phase 1 can present optional tiers for contract intake, active contract-to-close coordination, and broker/admin oversight once Brett confirms pricing and inclusions.' },
  { eyebrow: 'CTA', title: 'Create a calmer contract-to-close process.', body: 'Request access, book a consult, or open the responsive demo workspace to see how Altitude handles today’s urgent work.' },
];

export const metadata = {
  title: 'Altitude Transactions — Colorado Contract-to-Close Coordination',
  description: 'Premium real estate transaction management for Colorado residential contract-to-close coordination.',
};

export default function LandingPage() {
  return <div className="at-landing"><nav className="at-landing-nav"><Link href="/" className="at-brand"><span>△</span><strong>Altitude Transactions</strong></Link><div><Link href="/login">Sign in</Link><Link className="at-btn at-btn-primary" href="/get-started">Get started</Link></div></nav><main><section className="at-hero"><p className="at-kicker">Hero · Colorado residential real estate</p><h1>Contract-to-close transaction control for premium Colorado broker operations.</h1><p>Altitude Transactions gives Brett a property-based command center for documents, deadlines, contacts, vendors, tasks, amendments, review decisions, and audit history.</p><div className="at-top-actions"><Link className="at-btn at-btn-primary" href="/get-started">Request access</Link><Link className="at-btn at-btn-ghost" href="/app/today">View demo workspace</Link></div></section>{sections.map((section) => <section className="at-landing-section" key={section.eyebrow}><p className="at-kicker">{section.eyebrow}</p><h2>{section.title}</h2><p>{section.body}</p></section>)}</main></div>;
}
