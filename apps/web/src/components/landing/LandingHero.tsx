import Link from 'next/link';
import {WORKFLOW_PREVIEW_DOCUMENTS} from '@/lib/document-workflow';

function HeroDashboardPreview() {
  const approved = WORKFLOW_PREVIEW_DOCUMENTS.filter((doc) => doc.workflowStatus === 'approved').length;
  const pending = WORKFLOW_PREVIEW_DOCUMENTS.filter((doc) => doc.workflowStatus === 'ready_for_review' || doc.workflowStatus === 'reviewed').length;

  return (
    <div className="lp-product-card" aria-label="Transaction dashboard preview">
      <div className="lp-product-topline">
        <div>
          <p className="lp-product-kicker">Transaction workspace</p>
          <h3>2140 Pine Ridge Road</h3>
        </div>
        <span className="lp-product-status">Active</span>
      </div>
      <div className="lp-product-metrics" aria-label="Transaction dashboard metrics">
        <div><strong>82%</strong><span>checklist complete</span></div>
        <div><strong>{pending}</strong><span>needs Brett review</span></div>
        <div><strong>{approved}</strong><span>approved sources</span></div>
      </div>
      <div className="lp-product-workspace">
        <div className="lp-file-rail">
          <p>Recent files</p>
          <span>Contract.pdf</span>
          <span>Earnest receipt.pdf</span>
          <span>Amend / Extend #2.pdf</span>
        </div>
        <div className="lp-product-main">
          {WORKFLOW_PREVIEW_DOCUMENTS.slice(0, 4).map((doc) => (
            <div key={doc.id} className="lp-product-row">
              <div>
                <strong>{doc.sequenceNumber ? `${doc.documentName} #${doc.sequenceNumber}` : doc.documentName}</strong>
                <span>{doc.fileName ?? (doc.neededState === 'not_applicable' ? 'Marked N/A' : 'Upload needed')}</span>
              </div>
              <em>{doc.workflowStatus.replaceAll('_', ' ')}</em>
            </div>
          ))}
        </div>
      </div>
      <div className="lp-deadline-strip">
        <span>Next deadline</span>
        <strong>Inspection Objection · Jun 12</strong>
      </div>
    </div>
  );
}

export function LandingHero() {
  return (
    <section className="lp-hero" aria-labelledby="hero-heading">
      <div className="lp-hero-inner lp-hero-grid">
        <div className="lp-hero-copy">
          <p className="lp-hero-eyebrow alt-eyebrow">Colorado contract-to-close infrastructure</p>
          <h1 id="hero-heading" className="lp-hero-h1">
            AI-enhanced transaction management for Colorado real estate professionals.
          </h1>
          <p className="lp-hero-sub">
            Altitude helps brokers and agents manage contract-to-close documents, deadlines, parties, and follow-up — with AI extraction routed through human review before anything updates the file.
          </p>
          <div className="lp-hero-actions">
            <Link href="/upload" className="lp-cta-primary">Start a Transaction</Link>
            <a href="#workflow" className="lp-cta-outline">See Workflow</a>
          </div>
          <p className="lp-hero-footnote">Upload → Review → Approve → deadline, contact, task, and status updates.</p>
        </div>
        <HeroDashboardPreview />
      </div>
    </section>
  );
}
