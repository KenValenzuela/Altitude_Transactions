import Link from 'next/link';

export function CTASection() {
  return (
    <div className="lp-inline-cta" aria-label="Get started">
      <div>
        <p className="alt-eyebrow">Ready for a cleaner close</p>
        <h3>Start with the next executed Colorado contract.</h3>
      </div>
      <div className="lp-inline-cta-actions">
        <Link href="/upload" className="lp-cta-primary">Start a Transaction</Link>
        <Link href="/login" className="lp-cta-outline lp-cta-outline--paper">Request a Demo</Link>
      </div>
    </div>
  );
}
