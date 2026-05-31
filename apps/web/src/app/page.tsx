import Link from 'next/link';

export const metadata = {
    title: 'Altitude — Contract-to-Close Concierge for Colorado Brokers',
    description:
        'Altitude turns CTME-exported contracts into a mobile transaction workspace. AI extraction, broker review, deadline tracking, and closeout — all from your phone.',
};

export default function LandingPage() {
    return (
        <div style={{fontFamily: 'var(--f-sans)', background: 'var(--bone)', color: 'var(--ink)'}}>
            <a href="#main-content" className="skip-link">Skip to main content</a>

            {/* ── Navigation ─────────────────────────────────────────────── */}
            <nav
                role="navigation"
                aria-label="Main navigation"
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 'var(--z-overlay)' as React.CSSProperties['zIndex'],
                    background: 'rgba(20,34,63,0.97)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    padding: '0 clamp(1rem, 5vw, 3rem)',
                }}
            >
                <div style={{
                    maxWidth: 1180,
                    margin: '0 auto',
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                }}>
                    {/* Logo */}
                    <Link href="/" aria-label="Altitude — home"
                          style={{display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none'}}>
                        <div style={{
                            width: 34,
                            height: 34,
                            borderRadius: 9,
                            background: 'linear-gradient(150deg,#E7CB7E 0%,#C9A14A 45%,#9C7726 78%,#D8B968 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 2px 8px rgba(0,0,0,.25)',
                        }}>
                            <svg width="20" height="16" viewBox="0 0 22 17" fill="none" aria-hidden="true">
                                <path d="M11 1L17.5 12.5H4.5L11 1Z" fill="white" opacity="0.95"/>
                                <path d="M16 4.5L21.5 12.5H10.5L16 4.5Z" fill="white" opacity="0.5"/>
                                <path d="M5.5 6.5L10 12.5H1L5.5 6.5Z" fill="white" opacity="0.35"/>
                            </svg>
                        </div>
                        <span style={{color: 'white', fontWeight: 700, fontSize: 15.5, letterSpacing: '-0.015em'}}>
              Altitude
            </span>
                    </Link>

                    {/* Nav links — hidden on mobile */}
                    <div style={{display: 'flex', alignItems: 'center', gap: 6}} aria-label="Site links">
                        <Link href="/walkthrough" className="nav-ghost-link">
                            Demo
                        </Link>
                        <Link href="/dashboard" style={{
                            color: 'var(--alt-navy)',
                            textDecoration: 'none',
                            fontSize: 14,
                            fontWeight: 700,
                            padding: '7px 18px',
                            borderRadius: 999,
                            background: 'var(--alt-gold)',
                            transition: 'background 0.15s',
                            minHeight: 38,
                            display: 'inline-flex',
                            alignItems: 'center',
                        }}>
                            Open dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero ───────────────────────────────────────────────────── */}
            <main id="main-content">
                <section
                    className="alt-topo"
                    aria-labelledby="hero-heading"
                    style={{
                        background: 'var(--alt-navy)',
                        color: 'white',
                        padding: 'clamp(4rem, 10vw, 8rem) clamp(1rem, 5vw, 3rem)',
                        textAlign: 'center',
                    }}
                >
                    <div style={{maxWidth: 760, margin: '0 auto'}}>
                        <div className="alt-eyebrow" style={{color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem'}}>
                            Colorado Residential Real Estate
                        </div>
                        <h1
                            id="hero-heading"
                            className="alt-display"
                            style={{
                                fontSize: 'clamp(2.25rem, 6vw, 4rem)',
                                lineHeight: 1.05,
                                color: 'white',
                                margin: '0 0 1.5rem',
                            }}
                        >
                            Your contract-to-close concierge,{' '}
                            <span style={{fontStyle: 'italic', color: 'var(--gold)'}}>on your phone.</span>
                        </h1>
                        <p style={{
                            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                            color: 'rgba(255,255,255,0.72)',
                            lineHeight: 1.65,
                            margin: '0 auto 2.5rem',
                            maxWidth: 580,
                        }}>
                            Altitude takes your CTME-exported contract PDF and turns it into a complete
                            mobile workspace: deadlines, tasks, contacts, documents, and closeout tracking —
                            reviewed and approved by you before anything becomes official.
                        </p>

                        <div style={{display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap'}}>
                            <Link
                                href="/upload"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '13px 30px',
                                    background: 'var(--alt-gold)',
                                    color: 'var(--alt-navy)',
                                    borderRadius: 999,
                                    textDecoration: 'none',
                                    fontWeight: 700,
                                    fontSize: 15,
                                    letterSpacing: '-0.01em',
                                    minHeight: 48,
                                    transition: 'background 0.15s',
                                    boxShadow: '0 4px 20px rgba(214,168,79,.35)',
                                }}
                            >
                                Upload a contract
                            </Link>
                            <Link
                                href="/dashboard"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '13px 28px',
                                    background: 'transparent',
                                    color: 'rgba(255,255,255,0.85)',
                                    border: '1.5px solid rgba(255,255,255,0.2)',
                                    borderRadius: 999,
                                    textDecoration: 'none',
                                    fontWeight: 500,
                                    fontSize: 15,
                                    minHeight: 48,
                                    transition: 'border-color 0.15s, color 0.15s',
                                }}
                            >
                                Open dashboard
                            </Link>
                        </div>

                        <p style={{
                            marginTop: '1.75rem',
                            fontSize: 12,
                            color: 'rgba(255,255,255,0.35)',
                            letterSpacing: '0.02em'
                        }}>
                            CTME remains the official contract platform. Altitude is your operational workflow layer.
                        </p>
                    </div>
                </section>

                {/* ── How it works ───────────────────────────────────────────── */}
                <section
                    aria-labelledby="how-heading"
                    style={{
                        background: 'var(--alt-surface)',
                        padding: 'clamp(3rem, 8vw, 6rem) clamp(1rem, 5vw, 3rem)',
                    }}
                >
                    <div style={{maxWidth: 1080, margin: '0 auto'}}>
                        <div style={{textAlign: 'center', marginBottom: 'clamp(2rem, 5vw, 4rem)'}}>
                            <div className="alt-eyebrow" style={{marginBottom: '0.75rem'}}>The workflow</div>
                            <h2
                                id="how-heading"
                                style={{
                                    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                                    fontFamily: 'var(--f-display)',
                                    fontWeight: 400,
                                    margin: 0
                                }}
                            >
                                From signed contract to closed deal
                            </h2>
                        </div>

                        <ol
                            style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                gap: 'clamp(1rem, 3vw, 1.5rem)',
                            }}
                        >
                            {[
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
                            ].map((step) => (
                                <li
                                    key={step.n}
                                    className="landing-step-card"
                                    style={{
                                        background: 'var(--alt-bg)',
                                        border: '1px solid var(--alt-border)',
                                        borderRadius: 14,
                                        padding: 'clamp(1rem, 2.5vw, 1.5rem)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 10,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 8,
                                        }}
                                    >
                                        <span style={{
                                            width: 26, height: 26, borderRadius: 999,
                                            background: 'var(--alt-navy)',
                                            color: 'var(--alt-gold)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 11, fontWeight: 800, fontFamily: 'var(--f-mono)',
                                            flexShrink: 0,
                                        }}>{step.n}</span>
                                    </div>
                                    <div style={{fontSize: 15, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3}}>
                                        {step.title}
                                    </div>
                                    <div style={{fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.6}}>
                                        {step.body}
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* ── Feature highlights ─────────────────────────────────────── */}
                <section
                    aria-labelledby="features-heading"
                    style={{
                        background: 'var(--alt-bg)',
                        padding: 'clamp(3rem, 8vw, 6rem) clamp(1rem, 5vw, 3rem)',
                        borderTop: '1px solid var(--alt-border)',
                    }}
                >
                    <div style={{maxWidth: 1080, margin: '0 auto'}}>
                        <div style={{textAlign: 'center', marginBottom: 'clamp(2rem, 5vw, 3.5rem)'}}>
                            <div className="alt-eyebrow" style={{marginBottom: '0.75rem'}}>What you get</div>
                            <h2
                                id="features-heading"
                                style={{
                                    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                                    fontFamily: 'var(--f-display)',
                                    fontWeight: 400,
                                    margin: 0
                                }}
                            >
                                Every transaction, fully tracked
                            </h2>
                        </div>

                        <ul
                            style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                gap: 'clamp(1rem, 3vw, 1.25rem)',
                            }}
                        >
                            {[
                                {
                                    label: 'Deadline timeline',
                                    desc: 'Every CTME deadline extracted, dated, and tracked. Overdue items surface immediately. Today marker shows where you stand.',
                                    accent: 'var(--alt-warning)',
                                },
                                {
                                    label: 'Task checklist',
                                    desc: 'Operational tasks generated from your contract. Complete them from your phone as you move through the deal.',
                                    accent: 'var(--alt-navy-800)',
                                },
                                {
                                    label: 'Contact matrix',
                                    desc: 'Buyer, seller, lenders, title, inspectors — all parties and vendors in one tap-to-call contact screen.',
                                    accent: 'var(--alt-navy-800)',
                                },
                                {
                                    label: 'Document tracker',
                                    desc: 'Required, conditional, and missing documents tracked against the Colorado transaction checklist.',
                                    accent: 'var(--alt-gold)',
                                },
                                {
                                    label: 'Source-backed review',
                                    desc: 'AI extraction is a starting point. Every extracted field shows its source evidence — you approve before anything becomes part of the file.',
                                    accent: 'var(--alt-info)',
                                },
                                {
                                    label: 'Closeout tracking',
                                    desc: 'Post-close tasks, thank-you follow-up, review requests, and referral tracking — nothing falls through after closing.',
                                    accent: 'var(--alt-success)',
                                },
                            ].map((feat) => (
                                <li
                                    key={feat.label}
                                    className="landing-feature-card"
                                    style={{
                                        background: 'var(--alt-surface)',
                                        border: '1px solid var(--alt-border)',
                                        borderLeft: `3px solid ${feat.accent}`,
                                        borderRadius: 14,
                                        padding: 'clamp(1rem, 2.5vw, 1.5rem)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 8,
                                    }}
                                >
                                    <div style={{fontSize: 14, fontWeight: 600, color: 'var(--alt-navy)'}}>
                                        {feat.label}
                                    </div>
                                    <div style={{fontSize: 13.5, color: 'var(--alt-muted)', lineHeight: 1.65}}>
                                        {feat.desc}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* ── Trust / positioning ────────────────────────────────────── */}
                <section
                    aria-labelledby="trust-heading"
                    style={{
                        background: 'var(--alt-surface)',
                        padding: 'clamp(3rem, 8vw, 6rem) clamp(1rem, 5vw, 3rem)',
                        borderTop: '1px solid var(--alt-border)',
                    }}
                >
                    <div style={{maxWidth: 680, margin: '0 auto', textAlign: 'center'}}>
                        <h2
                            id="trust-heading"
                            className="alt-display"
                            style={{
                                fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                                fontWeight: 400,
                                margin: '0 0 1.25rem',
                                lineHeight: 1.15
                            }}
                        >
                            Built for Colorado brokers who use CTME
                        </h2>
                        <p style={{
                            fontSize: 15,
                            color: 'var(--ink-2)',
                            lineHeight: 1.7,
                            margin: '0 auto 2rem',
                            maxWidth: 540
                        }}>
                            Altitude does not replace CTME. It reads from it. Your contracts stay in CTME
                            for legal execution and e-signature. Altitude turns the exported PDF into an
                            operational mobile workspace — the layer between contract execution and closed file.
                        </p>
                        <div
                            style={{
                                display: 'flex',
                                gap: 'clamp(0.75rem, 3vw, 2rem)',
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                                marginTop: '2rem',
                            }}
                        >
                            {[
                                {label: 'Source-backed extraction', sub: 'Every AI field is broker-reviewed'},
                                {label: 'Mobile-first design', sub: 'Built for brokers in the field'},
                                {label: 'Full audit trail', sub: 'Every action logged and timestamped'},
                            ].map((stat) => (
                                <div key={stat.label} style={{
                                    textAlign: 'center', minWidth: 120,
                                    padding: '1rem 1.25rem',
                                    background: 'var(--alt-bg)',
                                    border: '1px solid var(--alt-border)',
                                    borderRadius: 12,
                                }}>
                                    <div style={{
                                        fontSize: 13.5,
                                        fontWeight: 700,
                                        color: 'var(--alt-navy)'
                                    }}>{stat.label}</div>
                                    <div style={{fontSize: 12.5, color: 'var(--alt-muted)', marginTop: 5}}>{stat.sub}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Final CTA ──────────────────────────────────────────────── */}
                <section
                    aria-labelledby="cta-heading"
                    className="alt-topo"
                    style={{
                        background: 'var(--alt-navy)',
                        padding: 'clamp(3.5rem, 8vw, 6rem) clamp(1rem, 5vw, 3rem)',
                        textAlign: 'center',
                    }}
                >
                    <div style={{maxWidth: 560, margin: '0 auto'}}>
                        <div className="alt-eyebrow" style={{color: 'rgba(255,255,255,0.4)', marginBottom: '1rem'}}>
                            Ready to start
                        </div>
                        <h2
                            id="cta-heading"
                            className="alt-display"
                            style={{
                                fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
                                color: 'white',
                                fontWeight: 400,
                                margin: '0 0 1.25rem',
                                lineHeight: 1.1
                            }}
                        >
                            Your first transaction is three minutes away.
                        </h2>
                        <p style={{
                            fontSize: 15,
                            color: 'rgba(255,255,255,0.6)',
                            lineHeight: 1.65,
                            margin: '0 auto 2.5rem',
                            maxWidth: 420
                        }}>
                            Upload a CTME PDF. Review the extraction. Open your workspace.
                        </p>
                        <div style={{display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap'}}>
                            <Link
                                href="/upload"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '14px 34px',
                                    background: 'var(--alt-gold)',
                                    color: 'var(--alt-navy)',
                                    borderRadius: 999,
                                    textDecoration: 'none',
                                    fontWeight: 700,
                                    fontSize: 15,
                                    minHeight: 48,
                                    letterSpacing: '-0.01em',
                                    boxShadow: '0 4px 20px rgba(214,168,79,.3)',
                                }}
                            >
                                Upload a contract
                            </Link>
                            <Link
                                href="/dashboard"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '14px 32px',
                                    background: 'transparent',
                                    color: 'rgba(255,255,255,0.8)',
                                    border: '1.5px solid rgba(255,255,255,0.2)',
                                    borderRadius: 999,
                                    textDecoration: 'none',
                                    fontWeight: 500,
                                    fontSize: 15,
                                    minHeight: 48,
                                }}
                            >
                                Open dashboard
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── Footer ─────────────────────────────────────────────────── */}
                <footer
                    role="contentinfo"
                    style={{
                        background: 'var(--alt-navy)',
                        borderTop: '1px solid rgba(255,255,255,0.07)',
                        padding: '2rem clamp(1rem, 5vw, 3rem)',
                    }}
                >
                    <div style={{
                        maxWidth: 1080,
                        margin: '0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 16,
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                            <div style={{
                                width: 26,
                                height: 26,
                                borderRadius: 7,
                                background: 'linear-gradient(150deg,#E7CB7E 0%,#C9A14A 45%,#9C7726 78%,#D8B968 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <svg width="15" height="11" viewBox="0 0 18 13" fill="none" aria-hidden="true">
                                    <path d="M9 1L14 10H4L9 1Z" fill="white" opacity="0.95"/>
                                    <path d="M13.5 4L17.5 10H9.5L13.5 4Z" fill="white" opacity="0.5"/>
                                </svg>
                            </div>
                            <span style={{color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 500}}>
                Altitude Transactions
              </span>
                        </div>
                        <nav aria-label="Footer navigation" style={{display: 'flex', gap: 20}}>
                            {[
                                {label: 'Dashboard', href: '/dashboard'},
                                {label: 'Demo', href: '/walkthrough'},
                                {label: 'Upload', href: '/upload'},
                            ].map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    style={{color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 13}}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </footer>
            </main>
        </div>
    );
}
