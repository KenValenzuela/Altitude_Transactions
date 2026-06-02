import type {ExtractionJob} from '@/types/domain';

type Props = {
    job?: ExtractionJob;
    simulatedStep?: number;
    minElapsed?: boolean;
};

const STEPS = [
    {label: 'PDF received', detail: 'Contract file stored securely.'},
    {label: 'Reading contract', detail: 'Locating sections, pages, and text layers.'},
    {label: 'Extracting parties & terms', detail: 'Identifying buyer, seller, price, and key terms.'},
    {label: 'Extracting deadlines', detail: 'Reading Dates and Deadlines (§29).'},
    {label: 'Checking N/A fields', detail: 'Confirming which deadlines do not apply.'},
    {label: 'Preparing review queue', detail: 'Ordering fields by priority and confidence.'},
];

function IcCheck() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
    );
}

function IcSpinner() {
  return (
      <svg className="alt-spin" width="12" height="12" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
  );
}

export function ExtractionProgress({job, simulatedStep = 0, minElapsed = false}: Props) {
    const isFailed = job?.status === 'failed';
    const isReady = minElapsed && (job?.status === 'needs_review' || job?.status === 'approved' || job?.status === 'complete');
    const displayStep = simulatedStep;
    const pct = Math.min(100, Math.round((displayStep / STEPS.length) * 100));

    return (
        <section
            aria-labelledby="extraction-title"
            aria-live="polite"
            style={{maxWidth: 520}}
        >
            {/* Header */}
            <div style={{
                background: 'var(--ink-900)',
                backgroundImage: 'linear-gradient(135deg, var(--ink-900) 0%, var(--ink-700) 100%)',
                borderRadius: 'var(--r-xl)',
                padding: '28px 28px 24px',
                marginBottom: 16,
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Subtle shimmer line */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                    background: 'linear-gradient(90deg, transparent 0%, var(--brass-400) 50%, transparent 100%)',
                    animation: 'alt-shimmer 2s ease-in-out infinite',
                }} aria-hidden="true"/>

                <div className="dk-eyebrow" style={{color: 'var(--fg3-on-navy)', marginBottom: 8}}>
                    AI extraction
                </div>
                <h2 id="extraction-title" style={{
                    fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 600,
                    color: '#f6efe2', margin: '0 0 6px', letterSpacing: '-0.01em',
                }}>
                    {isReady ? 'Review queue ready' : isFailed ? 'Extraction stopped' : 'Preparing your workspace…'}
                </h2>
                <p style={{fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--fg2-on-navy)', margin: 0}}>
                    {isReady
                        ? 'All fields extracted. Taking you to the review queue now.'
                        : isFailed
                            ? 'Extraction could not complete.'
                            : 'Altitude is reading your CTME contract. Every extracted value goes through your review before becoming part of the file.'}
                </p>

                {/* Progress bar */}
                <div style={{marginTop: 20}}>
                    <div style={{
                        height: 6, background: 'rgba(255,255,255,.1)', borderRadius: 99, overflow: 'hidden',
                    }}>
                        <div style={{
                            height: '100%', borderRadius: 99,
                            background: isReady ? 'var(--ok)' : 'linear-gradient(90deg, var(--brass-600), var(--brass-400))',
                            width: isReady ? '100%' : `${pct}%`,
                            transition: 'width 0.45s cubic-bezier(.2,.6,.2,1)',
                        }} aria-hidden="true"/>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 6}}>
            <span style={{fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg3-on-navy)'}}>
              {isReady ? 'Complete' : `${pct}%`}
            </span>
                        <span style={{fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--brass-400)'}}>
              {STEPS.length} steps
            </span>
                    </div>
                </div>
            </div>

            {/* Step list */}
            <div className="dk-list" role="list" aria-label="Extraction steps">
                {STEPS.map((step, i) => {
                    const stepNum = i + 1;
                    const done = displayStep > stepNum || isReady;
                    const active = displayStep === stepNum && !isReady;
                    const upcoming = displayStep < stepNum && !isReady;

                    return (
                        <div
                            key={step.label}
                            role="listitem"
                            aria-current={active ? 'step' : undefined}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 14, padding: '11px 16px',
                                borderTop: i > 0 ? '1px solid var(--line)' : 'none',
                                opacity: upcoming ? 0.35 : 1,
                                transition: 'opacity 0.4s ease',
                            }}
                        >
                            {/* Step indicator */}
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: done ? 'var(--ok)' : active ? 'var(--ink-900)' : 'var(--paper-200)',
                                color: done || active ? 'white' : 'var(--fg3)',
                                fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700,
                                transition: 'background 0.35s ease, transform 0.2s ease',
                                transform: active ? 'scale(1.08)' : 'scale(1)',
                                boxShadow: active ? '0 0 0 3px rgba(11,21,48,.15)' : 'none',
                            }}>
                                {done ? <IcCheck/> : active ? <IcSpinner/> : <span>{stepNum}</span>}
                            </div>

                            {/* Step text */}
                            <div style={{flex: 1, minWidth: 0}}>
                                <div style={{
                                    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13.5,
                                    color: done ? 'var(--fg2)' : active ? 'var(--fg1)' : 'var(--fg3)',
                                    display: 'flex', alignItems: 'center', gap: 8,
                                }}>
                                    {step.label}
                                    {done && !isReady && (
                                        <span
                                            style={{fontWeight: 400, fontSize: 11.5, color: 'var(--ok-text)'}}>✓</span>
                                    )}
                                    {active && (
                                        <span style={{
                                            fontWeight: 400,
                                            fontSize: 11.5,
                                            color: 'var(--fg-brass)',
                                            fontFamily: 'var(--font-mono)'
                                        }}>
                      in progress
                    </span>
                                    )}
                                </div>
                                {(active || done) && (
                                    <div style={{
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: 12,
                                        color: 'var(--fg3)',
                                        marginTop: 2
                                    }}>
                                        {step.detail}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <p style={{
                marginTop: 14, fontFamily: 'var(--font-sans)', fontSize: 12.5,
                color: 'var(--fg3)', lineHeight: 1.6,
                borderTop: '1px solid var(--line)', paddingTop: 14,
            }}>
                Every extracted value will be presented for your review before it becomes part of the
                transaction record. Nothing is committed until you approve it.
            </p>
    </section>
  );
}
