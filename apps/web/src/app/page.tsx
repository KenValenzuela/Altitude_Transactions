import Link from 'next/link';
import {AdminControlsSection} from '@/components/landing/AdminControlsSection';
import {DeadlineIntelligenceSection} from '@/components/landing/DeadlineIntelligenceSection';
import {DocumentChecklistPreview} from '@/components/landing/DocumentChecklistPreview';
import {LandingHero} from '@/components/landing/LandingHero';
import {PhaseTwoAutomationSection} from '@/components/landing/PhaseTwoAutomationSection';
import {ProblemSection} from '@/components/landing/ProblemSection';
import {UploadReviewApprovePreview} from '@/components/landing/UploadReviewApprovePreview';
import {WorkflowSteps} from '@/components/landing/WorkflowSteps';

export const metadata = {
  title: 'Altitude Transactions — Colorado Contract-to-Close Infrastructure',
  description:
    'AI-enhanced transaction management for Colorado real estate professionals: upload documents, review extraction, approve updates, and keep deadlines, contacts, and checklists source-backed.',
};

const BRAND_MARK_SVG = (
  <svg width="20" height="16" viewBox="0 0 22 17" fill="none" aria-hidden="true">
    <path d="M11 1L17.5 12.5H4.5L11 1Z" fill="white" opacity="0.95" />
    <path d="M16 4.5L21.5 12.5H10.5L16 4.5Z" fill="white" opacity="0.5" />
    <path d="M5.5 6.5L10 12.5H1L5.5 6.5Z" fill="white" opacity="0.35" />
  </svg>
);

const BRAND_MARK_SM = (
  <svg width="15" height="11" viewBox="0 0 18 13" fill="none" aria-hidden="true">
    <path d="M9 1L14 10H4L9 1Z" fill="white" opacity="0.95" />
    <path d="M13.5 4L17.5 10H9.5L13.5 4Z" fill="white" opacity="0.5" />
  </svg>
);

export default function LandingPage() {
  return (
    <div className="lp-page">
      <nav className="lp-nav" aria-label="Primary navigation">
        <div className="lp-nav-inner">
          <Link href="/" className="lp-brand" aria-label="Altitude Transactions home">
            <span className="lp-brand-mark">{BRAND_MARK_SVG}</span>
            <span className="lp-brand-name">Altitude Transactions</span>
          </Link>
          <div className="lp-nav-actions">
            <Link href="/login" className="lp-nav-signin">Sign in</Link>
            <Link href="/upload" className="lp-nav-cta">Start a Transaction</Link>
          </div>
        </div>
      </nav>

      <main>
        <LandingHero />
        <ProblemSection />
        <WorkflowSteps />
        <DocumentChecklistPreview />
        <UploadReviewApprovePreview />
        <DeadlineIntelligenceSection />
        <AdminControlsSection />
        <PhaseTwoAutomationSection />
      </main>

      <footer className="lp-footer" role="contentinfo">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <span className="lp-footer-mark">{BRAND_MARK_SM}</span>
            <span className="lp-footer-name">Altitude Transactions</span>
          </div>
          <nav aria-label="Footer navigation">
            <ul className="lp-footer-nav">
              <li><Link href="/login">Sign in</Link></li>
              <li><Link href="/upload">Start a Transaction</Link></li>
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
