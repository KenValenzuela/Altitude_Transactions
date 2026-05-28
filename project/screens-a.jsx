// screens-a.jsx — Login, Dashboard, Upload, AI Extraction, Review.

// ── 1. Login ────────────────────────────────────────────────────────────────
function ScreenLogin({ go }) {
  return (
    <PhoneShell label="01 Login">
      <div className="alt-screen-body alt-topo" style={{
        position: 'relative',
        padding: '90px 24px 28px',
        display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(180deg, var(--paper) 0%, var(--bone) 60%)',
      }}>
        {/* hero */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Monogram size={56} />
          <div className="alt-display" style={{
            fontSize: 56, fontStyle: 'italic', marginTop: 24, lineHeight: 0.95,
          }}>Altitude</div>
          <div style={{
            fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 14,
          }}>Contract to Close — Colorado</div>
          <div style={{
            fontSize: 15, lineHeight: 1.45, color: 'var(--ink-2)',
            marginTop: 22, maxWidth: 280,
          }}>
            A calmer way to run the 30 days between offer accepted and keys delivered.
          </div>
        </div>

        {/* sign-in card */}
        <div className="alt-card" style={{ padding: 18, marginBottom: 16 }}>
          <div className="alt-eyebrow" style={{ marginBottom: 10 }}>Signed in as</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar initials="BM" color="var(--sage-deep)" size={42}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>Brett Morales</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Altitude Realty · Denver</div>
            </div>
          </div>
          <div style={{ height: 1, background: 'var(--line)', margin: '14px 0' }}/>
          <Button full size="lg" variant="sage" onClick={() => go('dashboard')}>
            Continue to dashboard
          </Button>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 6, marginTop: 12,
            fontSize: 11, color: 'var(--ink-3)',
          }}>
            <svg width="11" height="13" viewBox="0 0 11 13" fill="none">
              <rect x="1" y="5.5" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1"/>
              <path d="M3 5.5 V3.5 A2.5 2.5 0 0 1 8 3.5 V5.5" stroke="currentColor" strokeWidth="1"/>
            </svg>
            Face ID enabled · CREC license 100089234
          </div>
        </div>

        <div style={{
          fontSize: 11, color: 'var(--ink-3)', textAlign: 'center',
          fontFamily: 'var(--f-mono)', letterSpacing: '0.08em',
        }}>
          v0.4 · sits beside CTME · does not replace it
        </div>
      </div>
    </PhoneShell>
  );
}

// ── 2. Dashboard ────────────────────────────────────────────────────────────
function ScreenDashboard({ go }) {
  const data = window.ALT_DATA;
  const [tab, setTab] = React.useState('home');
  const stats = {
    active: data.dashboard.length,
    closingThisWeek: 1,
    nextDeadline: 'Tue · Appraisal',
    days: 2,
  };
  return (
    <PhoneShell label="02 Dashboard">
      <TopBar
        eyebrow="Tuesday · April 16"
        title="Good morning, Brett"
        large
        trailing={
          <>
            <IconButton icon={Icon.search()} label="Search"/>
            <IconButton icon={Icon.bell()} badge="3" label="Notifications"/>
          </>
        }
      />
      <div className="alt-screen-body alt-scroll" style={{ paddingBottom: 110 }}>
        {/* KPI strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1.4fr 1fr',
          gap: 10, padding: '0 20px',
        }}>
          <div className="alt-card" style={{ padding: 16, background: 'var(--ink)', color: 'var(--paper)', border: 0 }}>
            <div className="alt-eyebrow" style={{ color: 'rgba(244,239,227,.55)' }}>Next up</div>
            <div className="alt-display" style={{ fontSize: 32, fontStyle: 'italic', marginTop: 6, color: '#F4EFE3' }}>
              {stats.days} <span style={{ fontSize: 16, fontStyle: 'normal' }}>days</span>
            </div>
            <div style={{ fontSize: 12, marginTop: 4, color: 'rgba(244,239,227,.7)' }}>
              {stats.nextDeadline}
            </div>
            <div style={{
              marginTop: 12, padding: '6px 10px', borderRadius: 8,
              background: 'rgba(244,239,227,0.08)', color: '#F4EFE3',
              fontSize: 11, display: 'inline-flex', gap: 6, alignItems: 'center',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--gold)' }} className="alt-pulse"/>
              Pine Ridge Trail
            </div>
          </div>
          <div className="alt-card" style={{ padding: 16 }}>
            <div className="alt-eyebrow">Active</div>
            <div className="alt-display" style={{ fontSize: 32, marginTop: 6 }}>
              {stats.active}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>transactions</div>
            <div style={{ height: 1, background: 'var(--line)', margin: '12px 0 10px' }}/>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Closing this week</span>
              <span style={{ color: 'var(--sage-deep)', fontWeight: 600 }}>{stats.closingThisWeek}</span>
            </div>
          </div>
        </div>

        {/* AI nudge */}
        <div style={{ padding: '14px 20px 4px' }}>
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: 14,
            background: 'var(--sage-tint)',
            border: '0.5px solid rgba(30,58,102,.22)',
            borderRadius: 'var(--r-md)',
          }}>
            <AIBadge size="lg"/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>
                Appraisal at Pine Ridge is tight.
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 2, lineHeight: 1.45 }}>
                Order placed Apr 16, due Apr 22. Suggest a Monday morning check-in with First Western.
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <Button size="sm" variant="sage">Draft message</Button>
                <Button size="sm" variant="ghost">Dismiss</Button>
              </div>
            </div>
          </div>
        </div>

        <SectionLabel action="View all">Transactions</SectionLabel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 20px' }}>
          {data.dashboard.map(tx => (
            <button
              key={tx.id}
              type="button"
              className="alt-card alt-tap"
              onClick={() => tx.active ? go('upload') : null}
              style={{
                appearance: 'none',
                width: '100%', textAlign: 'left',
                padding: 0, border: '1px solid var(--line)',
                background: 'var(--paper)',
                overflow: 'hidden',
              }}>
              <div style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: 'linear-gradient(155deg, #0E1A30, #1E3A66)',
                  position: 'relative', overflow: 'hidden', flexShrink: 0,
                }}>
                  <svg viewBox="0 0 52 52" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                    <path d="M0 40 L12 24 L20 32 L30 18 L40 28 L52 22 L52 52 L0 52 Z" fill="#0A1424"/>
                    <circle cx="40" cy="14" r="4" fill="#F4EFE3" opacity="0.85"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.address}
                    </div>
                    {tx.urgent && (
                      <span style={{
                        width: 6, height: 6, borderRadius: 999,
                        background: 'var(--clay)', flexShrink: 0,
                      }} className="alt-pulse"/>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
                    {tx.city} · {tx.parties}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <div style={{
                      flex: 1, height: 4, borderRadius: 999, background: 'var(--paper-2)',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${tx.progress * 100}%`, height: '100%',
                        background: tx.progress > 0.85 ? 'var(--sage)' : 'var(--ink)',
                        borderRadius: 999,
                      }}/>
                    </div>
                    <div className="alt-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
                      {tx.daysToClose}d
                    </div>
                  </div>
                </div>
                <div style={{ color: 'var(--ink-3)' }}>{Icon.chevR()}</div>
              </div>
              <div style={{
                padding: '8px 14px', background: 'var(--paper-2)',
                borderTop: '1px solid var(--line)',
                fontSize: 11, color: 'var(--ink-2)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span>{tx.stage}</span>
                <span style={{
                  color: tx.urgent ? 'var(--clay)' : 'var(--ink-3)',
                  fontWeight: tx.urgent ? 500 : 400,
                }}>{tx.next}</span>
              </div>
            </button>
          ))}
        </div>

        {/* CTA: upload new contract */}
        <div style={{ padding: '20px 20px 8px' }}>
          <button
            type="button"
            onClick={() => go('upload')}
            className="alt-tap"
            style={{
              appearance: 'none', width: '100%',
              padding: '20px 18px', borderRadius: 'var(--r-md)',
              border: '1.5px dashed var(--line-strong)',
              background: 'transparent',
              display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
              color: 'var(--ink-2)',
            }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'var(--sage-tint)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--sage-deep)',
            }}>
              {Icon.upload()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                Start a new transaction
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 1 }}>
                Drop a CTM contract PDF — AI extracts deadlines and tasks.
              </div>
            </div>
            <div style={{ color: 'var(--ink-3)' }}>{Icon.chevR()}</div>
          </button>
        </div>
      </div>
      <TabBar active={tab} onChange={setTab} items={[
        { id: 'home',     label: 'Home',      icon: Icon.home },
        { id: 'cal',      label: 'Calendar',  icon: Icon.calendar },
        { id: 'tasks',    label: 'Tasks',     icon: Icon.list },
        { id: 'docs',     label: 'Docs',      icon: Icon.doc },
      ]}/>
    </PhoneShell>
  );
}

// ── 3. Upload contract ─────────────────────────────────────────────────────
function ScreenUpload({ go }) {
  return (
    <PhoneShell label="03 Upload">
      <TopBar
        title="New transaction"
        subtitle="Start by giving us the contract."
        leading={<IconButton icon={Icon.back()} onClick={() => go('dashboard')} label="Back"/>}
      />
      <div className="alt-screen-body alt-scroll" style={{ padding: '0 20px 24px' }}>
        <div className="alt-eyebrow" style={{ marginBottom: 8 }}>Step 1 of 5</div>

        {/* Big drop target */}
        <div className="alt-card" style={{
          padding: 24, textAlign: 'center',
          borderStyle: 'dashed', borderColor: 'var(--line-strong)',
          background: 'var(--paper)',
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: 'var(--sage-tint)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--sage-deep)', marginBottom: 16,
          }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M6 5 H18 L22 9 V22 A1 1 0 0 1 21 23 H7 A1 1 0 0 1 6 22 Z"
                stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
              <path d="M18 5 V9 H22" stroke="currentColor" strokeWidth="1.4" fill="none"/>
              <path d="M14 12 V19 M11 15 L14 12 L17 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="alt-display" style={{ fontSize: 22 }}>
            Drop the contract
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.45 }}>
            Contract to Buy &amp; Sell, Inspection Objection, anything from CTME.
            We'll read it and pull out the deadlines.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 18 }}>
            <Button full variant="sage" onClick={() => go('extracting')}>
              Choose PDF from Files
            </Button>
            <Button full variant="secondary" onClick={() => go('extracting')}>
              Scan with camera
            </Button>
            <Button full variant="ghost" onClick={() => go('extracting')}>
              Paste CTME share link
            </Button>
          </div>
        </div>

        {/* What we'll do */}
        <SectionLabel>What we'll do</SectionLabel>
        <div className="alt-card" style={{ padding: 4 }}>
          {[
            { t: 'Read the contract', s: 'Parse parties, property, prices, dates.', i: <AIBadge/> },
            { t: 'Pull every deadline', s: 'Inspection, appraisal, loan, closing — all dates with hours.', i: <AIBadge/> },
            { t: 'Build your checklist', s: 'Tasks pre-filled. You mark N/A what doesn\'t apply.' },
            { t: 'You review every item', s: 'Nothing official is sent or filed without your approval.' },
          ].map((row, i, a) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 14px',
              borderBottom: i < a.length - 1 ? '0.5px solid var(--line)' : 'none',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: 999,
                background: 'var(--paper-2)', color: 'var(--ink-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600, flexShrink: 0,
                fontFamily: 'var(--f-mono)',
              }}>{i+1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {row.t} {row.i}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{row.s}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 14, fontSize: 11, color: 'var(--ink-3)',
          textAlign: 'center', lineHeight: 1.5, fontFamily: 'var(--f-mono)',
          letterSpacing: '0.04em',
        }}>
          CTME stays the source of truth. Altitude tracks the work around it.
        </div>
      </div>
    </PhoneShell>
  );
}

// ── 4. AI Extracting ───────────────────────────────────────────────────────
function ScreenExtracting({ go }) {
  const [progress, setProgress] = React.useState(0);
  const [step, setStep] = React.useState(0);
  const steps = [
    'Reading contract pages…',
    'Identifying parties & property…',
    'Extracting dates and deadlines…',
    'Cross-checking CREC form references…',
    'Building checklist…',
  ];
  React.useEffect(() => {
    const t = setInterval(() => {
      setProgress(p => {
        const n = p + 1.6;
        if (n >= 100) { clearInterval(t); setTimeout(() => go('review'), 600); return 100; }
        return n;
      });
    }, 70);
    return () => clearInterval(t);
  }, [go]);
  React.useEffect(() => {
    setStep(Math.min(steps.length - 1, Math.floor((progress / 100) * steps.length)));
  }, [progress]);

  return (
    <PhoneShell label="04 AI Extracting" dark>
      <div className="alt-screen-body" style={{
        background: 'radial-gradient(ellipse at 50% 30%, #16263F 0%, #0A1320 70%)',
        color: '#F4EFE3',
        padding: '90px 24px 40px',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'rgba(244,239,227,.5)',
        }}>
          <AIBadge label="AI · Reading"/>
          <span>Contract_PineRidge.pdf · 14 pp</span>
        </div>

        {/* Animated paper card */}
        <div style={{
          marginTop: 28, position: 'relative',
          height: 240, borderRadius: 18,
          background: '#F4EFE3', color: 'var(--ink)',
          padding: '20px 18px', overflow: 'hidden',
          boxShadow: '0 30px 60px rgba(0,0,0,.5)',
        }}>
          <div className="alt-eyebrow" style={{ marginBottom: 8 }}>CBS-1-4-22 · §29</div>
          <div className="alt-display" style={{ fontSize: 16, fontStyle: 'italic' }}>
            Contract to Buy and Sell Real Estate
          </div>
          {/* fake text lines with progressive highlight */}
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 7 }}>
            {[
              { w: '88%', highlight: progress > 8 },
              { w: '62%', highlight: progress > 18, label: 'Property' },
              { w: '94%', highlight: progress > 28 },
              { w: '70%', highlight: progress > 38, label: 'Earnest $28,000' },
              { w: '85%', highlight: progress > 48 },
              { w: '74%', highlight: progress > 58, label: 'Inspection Apr 17' },
              { w: '90%', highlight: progress > 68, label: 'Appraisal Apr 22' },
              { w: '60%', highlight: progress > 78, label: 'Closing May 01' },
            ].map((row, i) => (
              <div key={i} style={{
                position: 'relative', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{
                  height: 6, width: row.w, borderRadius: 4,
                  background: row.highlight ? 'rgba(30,58,102,.32)' : 'rgba(0,0,0,.08)',
                  transition: 'background .3s',
                }}/>
                {row.label && row.highlight && (
                  <div style={{
                    fontFamily: 'var(--f-mono)', fontSize: 9,
                    color: 'var(--sage-deep)', letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                  }}>· {row.label}</div>
                )}
              </div>
            ))}
          </div>
          {/* scanning line */}
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 3,
            top: `${20 + (progress * 1.8)}px`,
            background: 'linear-gradient(90deg, transparent, var(--sage), transparent)',
            boxShadow: '0 0 16px rgba(30,58,102,.55)',
            transition: 'top .07s linear',
            opacity: progress < 95 ? 1 : 0,
          }}/>
        </div>

        {/* progress + step list */}
        <div style={{ marginTop: 36 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            marginBottom: 10,
          }}>
            <div className="alt-display" style={{ fontSize: 26, fontStyle: 'italic', color: '#F4EFE3' }}>
              Working…
            </div>
            <div className="alt-mono" style={{ fontSize: 12, color: 'rgba(244,239,227,.55)' }}>
              {Math.round(progress)}%
            </div>
          </div>
          <div style={{
            height: 3, borderRadius: 999, background: 'rgba(244,239,227,.12)',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress}%`, height: '100%',
              background: 'var(--sage)',
              transition: 'width .07s linear',
            }}/>
          </div>
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 13,
                color: i < step ? 'rgba(244,239,227,.55)' :
                       i === step ? '#F4EFE3' : 'rgba(244,239,227,.28)',
              }}>
                {i < step ? (
                  <span style={{ color: 'var(--sage)' }}>{Icon.check()}</span>
                ) : i === step ? (
                  <span style={{
                    width: 14, height: 14, display: 'inline-block', position: 'relative',
                  }}>
                    <span style={{
                      position: 'absolute', inset: 0, borderRadius: 999,
                      border: '1.5px solid var(--sage)', borderTopColor: 'transparent',
                      animation: 'alt-spin 0.9s linear infinite',
                    }}/>
                  </span>
                ) : (
                  <span style={{
                    width: 14, height: 14, borderRadius: 999,
                    border: '1.5px solid rgba(244,239,227,.18)', display: 'inline-block',
                  }}/>
                )}
                {s}
              </div>
            ))}
          </div>
        </div>

        <style>{`@keyframes alt-spin { to { transform: rotate(360deg); } }`}</style>

        <div style={{
          marginTop: 'auto', fontSize: 11,
          color: 'rgba(244,239,227,.45)', textAlign: 'center',
          lineHeight: 1.5,
        }}>
          AI extracts. You review every item. Nothing files until you say so.
        </div>
      </div>
    </PhoneShell>
  );
}

// ── 5. Review extraction ───────────────────────────────────────────────────
function ScreenReview({ go }) {
  const [confirmed, setConfirmed] = React.useState({});
  const findings = [
    { id: 'p', label: 'Property',         value: '4287 Pine Ridge Trail, Conifer CO 80433', conf: 0.99 },
    { id: 'b', label: 'Buyer',            value: 'Maya & Daniel Okafor',                    conf: 0.97 },
    { id: 's', label: 'Seller',           value: 'Robert & Linda Hayes',                     conf: 0.95 },
    { id: 'pr',label: 'Purchase price',   value: '$962,500',                                conf: 0.99 },
    { id: 'em',label: 'Earnest money',    value: '$28,000 · Heritage Title',                conf: 0.98 },
    { id: 'lt',label: 'Loan type',        value: 'Conventional 80%',                        conf: 0.93 },
  ];
  const deadlines = [
    { id: 'd1', label: 'Title commitment',         date: 'Apr 09', conf: 1   },
    { id: 'd2', label: 'Inspection deadline',      date: 'Apr 13', conf: 0.99 },
    { id: 'd3', label: 'Inspection Objection',     date: 'Apr 14', conf: 0.99 },
    { id: 'd4', label: 'Inspection Resolution',    date: 'Apr 17', conf: 0.99 },
    { id: 'd5', label: 'Appraisal deadline',       date: 'Apr 22', conf: 0.98 },
    { id: 'd6', label: 'Loan conditions',          date: 'Apr 26', conf: 0.96 },
    { id: 'd7', label: 'Closing date',             date: 'May 01', conf: 1   },
  ];

  return (
    <PhoneShell label="05 Review">
      <TopBar
        eyebrow="Step 2 of 5 · Confirm"
        title="What we found"
        leading={<IconButton icon={Icon.back()} onClick={() => go('upload')} label="Back"/>}
        trailing={<AIBadge size="lg" label="AI · Draft"/>}
      />
      <div className="alt-screen-body alt-scroll" style={{ padding: '0 20px 120px' }}>
        <div style={{
          padding: 12, background: 'var(--sage-tint)', borderRadius: 'var(--r-sm)',
          border: '0.5px solid rgba(30,58,102,.22)',
          fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 14,
        }}>
          Tap any field to edit. Everything below comes from your contract — your name still goes on the file, so give it a once-over.
        </div>

        <SectionLabel style={{ padding: '4px 0 8px' }}>Transaction details</SectionLabel>
        <div className="alt-card" style={{ padding: 0 }}>
          {findings.map((f, i, a) => (
            <div key={f.id} className="alt-tap"
              onClick={() => setConfirmed(c => ({ ...c, [f.id]: !c[f.id] }))}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '14px 16px',
                borderBottom: i < a.length - 1 ? '0.5px solid var(--line)' : 'none',
              }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--f-mono)' }}>
                    {f.label}
                  </div>
                  <span style={{
                    fontSize: 9, color: 'var(--sage-deep)',
                    fontFamily: 'var(--f-mono)',
                  }}>{Math.round(f.conf*100)}%</span>
                </div>
                <div style={{ fontSize: 14, marginTop: 4, color: 'var(--ink)' }}>{f.value}</div>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: 999,
                background: confirmed[f.id] ? 'var(--sage)' : 'transparent',
                border: `1.5px solid ${confirmed[f.id] ? 'var(--sage)' : 'var(--line-strong)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 2,
              }}>
                {confirmed[f.id] && (
                  <svg width="11" height="11" viewBox="0 0 12 12">
                    <path d="M2.5 6.2 5 8.5 9.5 3.8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>

        <SectionLabel>Deadlines extracted · {deadlines.length}</SectionLabel>
        <div className="alt-card" style={{ padding: 0 }}>
          {deadlines.map((d, i, a) => (
            <div key={d.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px',
              borderBottom: i < a.length - 1 ? '0.5px solid var(--line)' : 'none',
            }}>
              <div style={{
                minWidth: 54, padding: '6px 8px', borderRadius: 8,
                background: 'var(--paper-2)', textAlign: 'center',
              }}>
                <div className="alt-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{d.date.split(' ')[0]}</div>
                <div className="alt-display" style={{ fontSize: 18, lineHeight: 1 }}>{d.date.split(' ')[1]}</div>
              </div>
              <div style={{ flex: 1, fontSize: 14 }}>{d.label}</div>
              <span className="alt-pill" style={{ background: 'var(--sage-tint)', color: 'var(--sage-deep)' }}>
                <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--sage)' }}/>
                {Math.round(d.conf*100)}%
              </span>
            </div>
          ))}
        </div>

        <SectionLabel>Conditional documents flagged</SectionLabel>
        <div className="alt-card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { t: 'Septic Use Permit required',         s: 'Rural property — Jefferson County permit needed at closing.', flag: 'rural' },
            { t: 'Well water tests required',          s: 'Potability + flow per §10.5.', flag: 'rural' },
            { t: 'HOA road maintenance docs',          s: 'Limited HOA detected — road assn. only, not full covenants.', flag: 'hoa' },
            { t: 'Mineral rights disclosure',          s: 'CO Mineral Rights Notice flagged.', flag: 'rural' },
          ].map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{
                width: 6, height: 6, borderRadius: 999, marginTop: 6, flexShrink: 0,
                background: 'var(--gold)',
              }}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{it.t}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.45 }}>
                  {it.s}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{
        position: 'absolute', left: 12, right: 12, bottom: 24, zIndex: 30,
        padding: '12px 14px', borderRadius: 22,
        background: 'rgba(250,247,240,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '0.5px solid var(--line)',
        boxShadow: 'var(--sh-2)',
        display: 'flex', gap: 10, alignItems: 'center',
      }}>
        <div style={{ flex: 1, fontSize: 12, color: 'var(--ink-3)' }}>
          {Object.values(confirmed).filter(Boolean).length} of {findings.length} confirmed
        </div>
        <Button variant="sage" onClick={() => go('overview')}>
          Build my checklist
        </Button>
      </div>
    </PhoneShell>
  );
}

Object.assign(window, {
  ScreenLogin, ScreenDashboard, ScreenUpload, ScreenExtracting, ScreenReview,
});
