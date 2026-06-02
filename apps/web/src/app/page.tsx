import Link from 'next/link';

export const metadata = {
    title: 'Altitude — Contract-to-Close Concierge for Colorado Brokers',
    description:
        'Altitude turns CTME-exported contracts into a mobile transaction workspace. AI extraction, broker review, deadline tracking, and closeout — all from your phone.',
};

/* ── Feature SVG icons ─────────────────────────────────────── */
function IcCalendar() {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>;
}

function IcCheckSquare() {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="9 11 12 14 22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>;
}

function IcUsers() {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>;
}

function IcFileText() {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
    </svg>;
}

function IcShieldCheck() {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
    </svg>;
}

function IcCheckCircle() {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>;
}

function IcArrowRight() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14"/>
        <path d="m12 5 7 7-7 7"/>
    </svg>;
}

const BRAND_MARK_SVG = (
    <svg width="20" height="16" viewBox="0 0 22 17" fill="none" aria-hidden="true">
        <path d="M11 1L17.5 12.5H4.5L11 1Z" fill="white" opacity="0.95"/>
        <path d="M16 4.5L21.5 12.5H10.5L16 4.5Z" fill="white" opacity="0.5"/>
        <path d="M5.5 6.5L10 12.5H1L5.5 6.5Z" fill="white" opacity="0.35"/>
    </svg>
);

const BRAND_MARK_SM = (
    <svg width="15" height="11" viewBox="0 0 18 13" fill="none" aria-hidden="true">
        <path d="M9 1L14 10H4L9 1Z" fill="white" opacity="0.95"/>
        <path d="M13.5 4L17.5 10H9.5L13.5 4Z" fill="white" opacity="0.5"/>
    </svg>
);

const STEPS = [
    {
        n: '01',
        title: 'Export from CTME',
        body: 'Generate your contract PDF in CTME as you normally would. Nothing changes in your contract workflow.',
    },
    {
        n: '02',
        title: 'Upload to Altitude',
        body: 'Drag the PDF into Altitude on desktop or photograph it from your phone. Upload takes seconds.',
    },
    {
        n: '03',
        title: 'AI extracts the details',
        body: 'Altitude reads deadlines, parties, amounts, dates, and N/A fields from the contract automatically.',
    },
    {
        n: '04',
        title: 'You review every field',
        body: 'Every extracted value is presented for your approval. Edit or reject anything before it becomes part of your file.',
    },
    {
        n: '05',
        title: 'Your workspace is live',
        body: 'Confirm and your transaction opens: timeline, task checklist, contact matrix, document tracker, and closeout log.',
    },
];

const FEATURES = [
    {
        label: 'Deadline timeline',
        desc: 'Every CTME deadline extracted, dated, and tracked. Overdue items surface immediately. Today marker shows where you stand.',
        icon: <IcCalendar/>,
        iconClass: 'lp-feature-icon--warn',
    },
    {
        label: 'Task checklist',
        desc: 'Operational tasks generated from your contract. Complete them from your phone as you move through the deal.',
        icon: <IcCheckSquare/>,
        iconClass: 'lp-feature-icon--navy',
    },
    {
        label: 'Contact matrix',
        desc: 'Buyer, seller, lenders, title, inspectors — all parties and vendors in one tap-to-call contact screen.',
        icon: <IcUsers/>,
        iconClass: 'lp-feature-icon--navy',
    },
    {
        label: 'Document tracker',
        desc: 'Required, conditional, and missing documents tracked against the Colorado transaction checklist.',
        icon: <IcFileText/>,
        iconClass: 'lp-feature-icon--gold',
    },
    {
        label: 'Source-backed review',
        desc: 'AI extraction is a starting point. Every extracted field shows its source evidence — you approve before anything becomes part of the file.',
        icon: <IcShieldCheck/>,
        iconClass: 'lp-feature-icon--navy',
    },
    {
        label: 'Closeout tracking',
        desc: 'Post-close tasks, thank-you follow-up, review requests, and referral tracking — nothing falls through after closing.',
        icon: <IcCheckCircle/>,
        iconClass: 'lp-feature-icon--ok',
    },
];

const TRUST_STATS = [
    {label: 'Source-backed extraction', sub: 'Every AI field is broker-reviewed'},
    {label: 'Mobile-first design', sub: 'Built for brokers in the field'},
    {label: 'Full audit trail', sub: 'Every action logged and timestamped'},
];

export default function LandingPage() {
    return (
        <div className="alt-lp-root">
            <a href="#main-content" className="skip-link">Skip to main content</a>

            {/* ── Navigation ──────────────────────────────────────── */}
            <nav className="lp-nav" role="navigation" aria-label="Main navigation">
                <div className="lp-nav-inner">
                    <Link href="/" className="lp-brand" aria-label="Altitude — home">
                        <span className="lp-brand-mark">{BRAND_MARK_SVG}</span>
                        <span className="lp-brand-name">Altitude</span>
                    </Link>
                    <div className="lp-nav-actions" aria-label="Site links">
                        <Link href="/login" className="lp-nav-signin">Sign in</Link>
                        <Link href="/login" className="lp-nav-cta">Get started</Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero ────────────────────────────────────────────── */}
            <main id="main-content">
                <section className="lp-hero alt-topo" aria-labelledby="hero-heading">
                    <div className="lp-hero-inner">
                        <div className="alt-eyebrow lp-hero-eyebrow">
                            Colorado Residential Real Estate
                        </div>
                        <h1 id="hero-heading" className="lp-hero-h1">
                            Your contract-to-close concierge,{' '}
                            <em className="lp-hero-em">on your phone.</em>
                        </h1>
                        <p className="lp-hero-sub">
                            Altitude takes your CTME-exported contract PDF and turns it into a complete
                            mobile workspace: deadlines, tasks, contacts, documents, and closeout tracking —
                            reviewed and approved by you before anything becomes official.
                        </p>
                        <div className="lp-hero-actions">
                            <Link href="/login" className="lp-cta-primary">
                                Get started free <IcArrowRight/>
                            </Link>
                            <Link href="/login" className="lp-cta-outline">
                                Sign in
                            </Link>
                        </div>
                        <p className="lp-hero-footnote">
                            CTME remains the official contract platform. Altitude is your operational workflow layer.
                        </p>
                    </div>
                </section>

                {/* ── How it works ────────────────────────────────── */}
                <section className="lp-section lp-section--white" aria-labelledby="how-heading">
                    <div className="lp-section-inner">
                        <div className="lp-section-header">
                            <div className="alt-eyebrow lp-section-eyebrow">The workflow</div>
                            <h2 id="how-heading" className="lp-section-h2">
                                From signed contract to closed deal
                            </h2>
                        </div>
                        <ol className="lp-steps-grid">
                            {STEPS.map((step) => (
                                <li key={step.n} className="lp-step">
                                    <span className="lp-step-num" aria-hidden="true">{step.n}</span>
                                    <div className="lp-step-title">{step.title}</div>
                                    <div className="lp-step-body">{step.body}</div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* ── Feature highlights ──────────────────────────── */}
                <section className="lp-section lp-section--paper" aria-labelledby="features-heading">
                    <div className="lp-section-inner">
                        <div className="lp-section-header">
                            <div className="alt-eyebrow lp-section-eyebrow">What you get</div>
                            <h2 id="features-heading" className="lp-section-h2">
                                Every transaction, fully tracked
                            </h2>
                        </div>
                        <ul className="lp-features-grid">
                            {FEATURES.map((feat) => (
                                <li key={feat.label} className="lp-feature">
                                    <div className="lp-feature-head">
                                        <span className={`lp-feature-icon ${feat.iconClass}`}>
                                            {feat.icon}
                                        </span>
                                        <span className="lp-feature-label">{feat.label}</span>
                                    </div>
                                    <p className="lp-feature-desc">{feat.desc}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* ── Trust / positioning ─────────────────────────── */}
                <section className="lp-section lp-section--white" aria-labelledby="trust-heading">
                    <div className="lp-section-inner--narrow">
                        <h2 id="trust-heading" className="lp-trust-h2 alt-display">
                            Built for Colorado brokers who use CTME
                        </h2>
                        <p className="lp-trust-sub">
                            Altitude does not replace CTME. It reads from it. Your contracts stay in CTME
                            for legal execution and e-signature. Altitude turns the exported PDF into an
                            operational mobile workspace — the layer between contract execution and closed file.
                        </p>
                        <div className="lp-trust-grid">
                            {TRUST_STATS.map((stat) => (
                                <div key={stat.label} className="lp-trust-stat">
                                    <div className="lp-trust-stat-label">{stat.label}</div>
                                    <div className="lp-trust-stat-sub">{stat.sub}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Final CTA ───────────────────────────────────── */}
                <section className="lp-cta-section lp-section--navy alt-topo" aria-labelledby="cta-heading">
                    <div className="lp-cta-inner">
                        <div className="alt-eyebrow lp-cta-eyebrow">Ready to start</div>
                        <h2 id="cta-heading" className="lp-cta-h2 alt-display">
                            Your first transaction is three minutes away.
                        </h2>
                        <p className="lp-cta-sub">
                            Upload a CTME PDF. Review the extraction. Open your workspace.
                        </p>
                        <div className="lp-cta-actions">
                            <Link href="/login" className="lp-cta-primary">
                                Create your account
                            </Link>
                            <Link href="/login" className="lp-cta-outline">
                                Sign in
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── Footer ──────────────────────────────────────── */}
                <footer className="lp-footer" role="contentinfo">
                    <div className="lp-footer-inner">
                        <div className="lp-footer-brand">
                            <span className="lp-footer-mark">{BRAND_MARK_SM}</span>
                            <span className="lp-footer-name">Altitude Transactions</span>
                        </div>
                        <nav aria-label="Footer navigation">
                            <ul className="lp-footer-nav">
                                <li><Link href="/login">Sign in</Link></li>
                                <li><Link href="/login">Get started</Link></li>
                            </ul>
                        </nav>
                    </div>
                </footer>
            </main>
        </div>
    );
}
