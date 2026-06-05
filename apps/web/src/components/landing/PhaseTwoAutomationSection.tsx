import {CTASection} from './CTASection';

export function PhaseTwoAutomationSection() {
  return (
    <section className="lp-section lp-section--navy" aria-labelledby="phase-two-heading">
      <div className="lp-section-inner">
        <div className="lp-section-header">
          <p className="lp-section-eyebrow alt-eyebrow lp-on-dark">Phase 2 closing experience</p>
          <h2 id="phase-two-heading" className="lp-section-h2 lp-section-h2--white">Built now for future buyer/seller automation — without pretending email is phase 1.</h2>
          <p className="lp-section-copy lp-copy-on-dark lp-centered-copy">
            Phase 1 keeps the product focused on uploaded documents, source tracking, and approved extracted data. The structure is ready for Brett’s future buyer/seller email templates, but does not build automated outbound emails or print-to-complete flows before they are scoped.
          </p>
        </div>
        <div className="lp-phase-grid">
          <div><strong>Phase 1</strong><span>Document upload, extraction review, approval, source history, deadlines, contacts, checklist completion.</span></div>
          <div><strong>Prepared for Phase 2</strong><span>Buyer/seller email templates and closing communications can attach to approved source data later.</span></div>
          <div><strong>Not included now</strong><span>No full automated email sending and no print-to-complete workflow unless explicitly required.</span></div>
        </div>
        <CTASection />
      </div>
    </section>
  );
}
