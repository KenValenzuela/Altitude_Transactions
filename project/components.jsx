// components.jsx — shared UI primitives for Altitude.

// ── Brand ───────────────────────────────────────────────────────────────────
function Wordmark({ size = 22, color, italic = true }) {
  return (
    <span style={{
      fontFamily: 'var(--f-display)',
      fontSize: size,
      fontStyle: italic ? 'italic' : 'normal',
      letterSpacing: '-0.012em',
      color: color || 'var(--ink)',
      lineHeight: 1,
    }}>
      Altitude
    </span>
  );
}

// Monogram: a metallic-gold altitude peak on a navy disc — the brand moment.
function Monogram({ size = 32, color }) {
  const uid = React.useId().replace(/:/g, '');
  const gid = `mg-${uid}`;
  // When an explicit color is passed (e.g. mono contexts) fall back to a flat mark.
  if (color) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="15.5" stroke={color} strokeOpacity="0.18" />
        <path d="M5 22 L13 11 L17.5 17 L22 13 L27 22 Z" fill={color} fillOpacity="0.9"/>
        <path d="M5 22 L13 11 L17.5 17 L22 13 L27 22" stroke={color} strokeWidth="1" strokeLinejoin="round" fill="none"/>
        <path d="M7 24 H25" stroke={color} strokeWidth="0.6" strokeOpacity="0.5"/>
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="4" y1="9" x2="28" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E7CB7E"/>
          <stop offset="0.42" stopColor="#C9A14A"/>
          <stop offset="0.78" stopColor="#9C7726"/>
          <stop offset="1" stopColor="#D8B968"/>
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15.5" fill="#14223F"/>
      <circle cx="16" cy="16" r="15.25" stroke={`url(#${gid})`} strokeOpacity="0.55" strokeWidth="0.5"/>
      <path d="M5 22 L13 11 L17.5 17 L22 13 L27 22 Z" fill={`url(#${gid})`}/>
      <path d="M5 22 L13 11 L17.5 17 L22 13 L27 22" stroke="#E7CB7E" strokeOpacity="0.6" strokeWidth="0.75" strokeLinejoin="round" fill="none"/>
      <path d="M7 24 H25" stroke={`url(#${gid})`} strokeWidth="0.6" strokeOpacity="0.4"/>
    </svg>
  );
}

// ── State chip — the 4-state checklist indicator ───────────────────────────
// states: 'todo' | 'doing' | 'done' | 'na'
const STATE_CFG = {
  todo:  { label: 'Not Started',     bg: 'var(--slate-soft)', fg: 'var(--slate)',     dot: '#9AA1A8' },
  doing: { label: 'In Progress',     bg: 'var(--gold-soft)',  fg: 'var(--gold)',      dot: '#C99A3F' },
  done:  { label: 'Complete',        bg: 'var(--sage-soft)',  fg: 'var(--sage-deep)', dot: 'var(--sage)' },
  na:    { label: 'Not Applicable',  bg: 'var(--na-soft)',    fg: 'var(--na)',        dot: '#B9B6A9' },
};

function StatePill({ state, compact = false }) {
  const c = STATE_CFG[state] || STATE_CFG.todo;
  return (
    <span className="alt-pill" style={{
      background: c.bg, color: c.fg,
      fontFamily: 'var(--f-sans)',
      textDecoration: state === 'na' ? 'line-through' : 'none',
      textDecorationColor: 'rgba(0,0,0,.18)',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: 999, background: c.dot,
        boxShadow: state === 'doing' ? '0 0 0 2px rgba(201,154,63,.18)' : 'none',
      }} />
      {!compact && c.label}
    </span>
  );
}

// A round checkbox-style cell — what the broker taps to cycle state.
function StateCell({ state, onClick, size = 26 }) {
  const c = STATE_CFG[state] || STATE_CFG.todo;
  const isDone = state === 'done';
  const isNA = state === 'na';
  const isDoing = state === 'doing';
  return (
    <button
      type="button"
      onClick={onClick}
      className="alt-tap"
      style={{
        appearance: 'none',
        width: size, height: size, minWidth: size,
        borderRadius: 999,
        border: `1.5px solid ${isDone ? 'var(--sage)' : isDoing ? 'var(--gold)' : isNA ? 'var(--na)' : 'var(--line-strong)'}`,
        background: isDone ? 'var(--sage)' : isDoing ? 'transparent' : isNA ? 'transparent' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 0,
      }}
      aria-label={c.label}
    >
      {isDone && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6.2 5 8.5 9.5 3.8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {isDoing && (
        <svg width="14" height="14" viewBox="0 0 14 14">
          <circle cx="7" cy="7" r="3" fill="var(--gold)" />
        </svg>
      )}
      {isNA && (
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path d="M3 6h6" stroke="var(--na)" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      )}
    </button>
  );
}

// Cycles the state on tap; long-press not modeled in this prototype — we expose
// a popover via the row instead.
function nextState(s) {
  return { todo: 'doing', doing: 'done', done: 'na', na: 'todo' }[s] || 'todo';
}

// ── AI markers ─────────────────────────────────────────────────────────────
function AIBadge({ size = 'sm', label = 'AI' }) {
  const isLg = size === 'lg';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      height: isLg ? 22 : 18,
      padding: isLg ? '0 8px' : '0 6px',
      borderRadius: 999,
      background: 'var(--sage-tint)',
      color: 'var(--sage-deep)',
      fontFamily: 'var(--f-mono)',
      fontSize: isLg ? 11 : 10,
      fontWeight: 500,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      border: '0.5px solid rgba(30,58,102,.25)',
    }}>
      <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
        <path d="M5 0.5 L6 4 L9.5 5 L6 6 L5 9.5 L4 6 L0.5 5 L4 4 Z" fill="var(--sage)" />
      </svg>
      {label}
    </span>
  );
}

// ── Buttons ────────────────────────────────────────────────────────────────
function Button({ children, variant = 'primary', size = 'md', onClick, icon, full, style }) {
  const sizes = {
    sm: { h: 32, px: 12, fs: 13, gap: 6 },
    md: { h: 44, px: 18, fs: 15, gap: 8 },
    lg: { h: 52, px: 22, fs: 16, gap: 10 },
  };
  const sz = sizes[size];
  const variants = {
    primary:   { bg: 'var(--ink)',  fg: 'var(--paper)',  bd: 'var(--ink)'  },
    sage:      { bg: 'var(--sage)', fg: '#fff',          bd: 'var(--sage)' },
    secondary: { bg: 'var(--paper)', fg: 'var(--ink)',   bd: 'var(--line-strong)' },
    ghost:     { bg: 'transparent', fg: 'var(--ink)',    bd: 'transparent' },
    clay:      { bg: 'var(--clay)', fg: '#fff',          bd: 'var(--clay)' },
  };
  const v = variants[variant];
  return (
    <button
      type="button"
      onClick={onClick}
      className="alt-tap"
      style={{
        appearance: 'none',
        height: sz.h,
        padding: `0 ${sz.px}px`,
        borderRadius: 999,
        background: v.bg,
        color: v.fg,
        border: `1px solid ${v.bd}`,
        fontFamily: 'var(--f-sans)',
        fontSize: sz.fs,
        fontWeight: 500,
        letterSpacing: '-0.005em',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sz.gap,
        width: full ? '100%' : 'auto',
        ...(style || {}),
      }}>
      {icon}
      {children}
    </button>
  );
}

// ── Avatar ─────────────────────────────────────────────────────────────────
function Avatar({ initials, color = 'var(--ink-3)', size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 999,
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--f-sans)', fontWeight: 500, fontSize: size * 0.36,
      flexShrink: 0,
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.18)',
    }}>{initials}</div>
  );
}

// ── Property hero ──────────────────────────────────────────────────────────
function PropertyHero({ property, height = 160 }) {
  // Stylized topographic "photo" placeholder
  return (
    <div style={{
      position: 'relative', height,
      borderRadius: 'var(--r-md)', overflow: 'hidden',
      background: 'linear-gradient(155deg, #0E1A30 0%, #1E3A66 55%, #B8862F 135%)',
    }}>
      <svg viewBox="0 0 320 160" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#F4EFE3" stopOpacity="0.35" />
            <stop offset="1" stopColor="#F4EFE3" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="320" height="160" fill="url(#sky)" />
        {/* far mountains */}
        <path d="M0 110 L40 86 L70 100 L110 72 L150 96 L190 78 L230 102 L270 84 L320 100 L320 160 L0 160 Z" fill="#1E3A66" opacity="0.55"/>
        {/* mid mountains */}
        <path d="M0 130 L30 118 L60 128 L100 108 L140 124 L180 110 L220 130 L260 116 L320 128 L320 160 L0 160 Z" fill="#0E1A30"/>
        {/* contour lines */}
        {[0,1,2,3].map(i => (
          <path key={i}
            d={`M0 ${135 + i*5} Q80 ${130 + i*5} 160 ${136 + i*5} T320 ${134 + i*5}`}
            stroke="rgba(244,239,227,0.18)" strokeWidth="0.5" fill="none"/>
        ))}
        {/* sun */}
        <circle cx="245" cy="42" r="14" fill="#F1ECDF" opacity="0.9"/>
      </svg>
      <div style={{
        position: 'absolute', left: 14, bottom: 12, right: 14,
        color: '#F4EFE3', textShadow: '0 1px 12px rgba(0,0,0,.3)',
      }}>
        <div style={{
          fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.16em',
          textTransform: 'uppercase', opacity: 0.85, marginBottom: 4,
        }}>{property.mls} · {property.type}</div>
        <div className="alt-display" style={{ fontSize: 22, lineHeight: 1.05 }}>
          {property.address}
        </div>
        <div style={{ fontSize: 12, opacity: 0.88, marginTop: 2 }}>{property.city}</div>
      </div>
    </div>
  );
}

// ── Stage rail — horizontal stepper ────────────────────────────────────────
function StageRail({ stages }) {
  return (
    <div style={{ padding: '6px 16px 14px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', left: 8, right: 8, top: 7, height: 1.5,
          background: 'var(--line)',
        }}/>
        {stages.map((s, i) => {
          const isDone = s.done;
          const isCurrent = s.current;
          return (
            <div key={s.id} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              flex: 1, position: 'relative', zIndex: 1, gap: 6,
            }}>
              <div style={{
                width: 14, height: 14, borderRadius: 999,
                background: isCurrent ? 'var(--gold)' : isDone ? 'var(--sage)' : 'var(--paper)',
                border: `1.5px solid ${isCurrent ? 'var(--gold)' : isDone ? 'var(--sage)' : 'var(--line-strong)'}`,
                boxShadow: isCurrent ? '0 0 0 4px rgba(182,139,60,.18)' : 'none',
              }}/>
              <div style={{
                fontSize: 9, color: isCurrent ? 'var(--ink)' : 'var(--ink-3)',
                fontWeight: isCurrent ? 600 : 400,
                textAlign: 'center', lineHeight: 1.1,
                fontFamily: 'var(--f-sans)',
                maxWidth: 50,
              }}>{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Section header ─────────────────────────────────────────────────────────
function SectionLabel({ children, action, style }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      padding: '18px 20px 8px', ...(style || {}),
    }}>
      <div className="alt-eyebrow">{children}</div>
      {action && <div style={{
        fontFamily: 'var(--f-sans)', fontSize: 12, color: 'var(--sage-deep)',
        fontWeight: 500,
      }}>{action}</div>}
    </div>
  );
}

// ── Tab bar (bottom nav within phone) ──────────────────────────────────────
function TabBar({ active, onChange, items }) {
  return (
    <div style={{
      position: 'absolute', left: 12, right: 12, bottom: 24,
      height: 62, zIndex: 30,
      background: 'rgba(250,247,240,0.78)',
      backdropFilter: 'blur(24px) saturate(160%)',
      WebkitBackdropFilter: 'blur(24px) saturate(160%)',
      borderRadius: 22,
      border: '0.5px solid rgba(0,0,0,0.06)',
      boxShadow: '0 8px 24px rgba(20,34,63,.12), 0 1px 0 rgba(255,255,255,.6) inset',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '0 12px',
    }}>
      {items.map(it => {
        const on = active === it.id;
        return (
          <button key={it.id}
            type="button"
            onClick={() => onChange(it.id)}
            className="alt-tap"
            style={{
              appearance: 'none', border: 0, background: 'transparent',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, padding: '6px 10px', borderRadius: 10,
              color: on ? 'var(--sage-deep)' : 'var(--ink-3)',
            }}>
            <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {it.icon(on)}
            </div>
            <div style={{
              fontSize: 9.5, fontWeight: on ? 600 : 500,
              letterSpacing: '0.02em', fontFamily: 'var(--f-sans)',
            }}>{it.label}</div>
          </button>
        );
      })}
    </div>
  );
}

// ── Icons (24x24 line) ─────────────────────────────────────────────────────
const Icon = {
  home: (on) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 10 L11 3 L19 10 V18 A1 1 0 0 1 18 19 H14 V14 H8 V19 H4 A1 1 0 0 1 3 18 Z"
        stroke="currentColor" strokeWidth={on ? 1.8 : 1.4} strokeLinejoin="round" fill={on ? 'rgba(30,58,102,.16)' : 'none'}/>
    </svg>
  ),
  list: (on) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="4" width="2.5" height="2.5" rx="0.5" fill="currentColor" opacity={on ? 1 : 0.7}/>
      <rect x="3" y="10" width="2.5" height="2.5" rx="0.5" fill="currentColor" opacity={on ? 1 : 0.7}/>
      <rect x="3" y="16" width="2.5" height="2.5" rx="0.5" fill="currentColor" opacity={on ? 1 : 0.7}/>
      <path d="M8 5.25 H19 M8 11.25 H19 M8 17.25 H19" stroke="currentColor" strokeWidth={on ? 1.7 : 1.3} strokeLinecap="round"/>
    </svg>
  ),
  calendar: (on) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth={on ? 1.7 : 1.3} fill={on ? 'rgba(30,58,102,.12)' : 'none'}/>
      <path d="M3 9 H19" stroke="currentColor" strokeWidth={on ? 1.7 : 1.3}/>
      <path d="M7 3 V6 M15 3 V6" stroke="currentColor" strokeWidth={on ? 1.7 : 1.3} strokeLinecap="round"/>
      <circle cx="11" cy="14" r="1.5" fill="currentColor"/>
    </svg>
  ),
  people: (on) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth={on ? 1.7 : 1.3} fill={on ? 'rgba(30,58,102,.12)' : 'none'}/>
      <path d="M2 18 C2 14 5 12 8 12 C11 12 14 14 14 18" stroke="currentColor" strokeWidth={on ? 1.7 : 1.3} strokeLinecap="round" fill="none"/>
      <circle cx="15" cy="9" r="2.4" stroke="currentColor" strokeWidth={on ? 1.4 : 1.1} fill="none"/>
      <path d="M14 14 C16 13.5 19 14 20 17" stroke="currentColor" strokeWidth={on ? 1.4 : 1.1} strokeLinecap="round" fill="none"/>
    </svg>
  ),
  doc: (on) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M5 3 H13 L18 8 V18 A1 1 0 0 1 17 19 H5 A1 1 0 0 1 4 18 V4 A1 1 0 0 1 5 3 Z"
        stroke="currentColor" strokeWidth={on ? 1.7 : 1.3} fill={on ? 'rgba(30,58,102,.12)' : 'none'}/>
      <path d="M13 3 V8 H18" stroke="currentColor" strokeWidth={on ? 1.7 : 1.3} fill="none"/>
    </svg>
  ),
  back: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M12.5 4 L6 10 L12.5 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  plus: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2 V14 M2 8 H14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  upload: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 11 V2 M5 5 L8 2 L11 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 11 V13 A1 1 0 0 0 4 14 H12 A1 1 0 0 0 13 13 V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  bell: () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4 13 V9 A5 5 0 0 1 14 9 V13 L15 14 H3 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
      <path d="M7.5 16 Q9 17 10.5 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  search: () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M12 12 L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  chevR: () => (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
      <path d="M2 2 L7 7 L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  alert: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1 L13 12 H1 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
      <path d="M7 5 V8 M7 10 V10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  sparkle: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1 L8.3 5.7 L13 7 L8.3 8.3 L7 13 L5.7 8.3 L1 7 L5.7 5.7 Z" fill="currentColor"/>
    </svg>
  ),
  check: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 7.2 L6 10 L11 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

// ── Phone shell — wraps content with status bar + home indicator ───────────
// We don't use the iOS frame's full chrome because we want our own nav bar
// styling; we lift the bezel only.
function PhoneShell({ children, width = 390, height = 844, dark = false, label }) {
  return (
    <div data-screen-label={label} style={{
      width, height, borderRadius: 52, overflow: 'hidden',
      position: 'relative',
      background: dark ? '#0A1320' : 'var(--bone)',
      boxShadow: 'var(--sh-3)',
      fontFamily: 'var(--f-sans)',
      WebkitFontSmoothing: 'antialiased',
    }}>
      {/* dynamic island */}
      <div style={{
        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
        width: 122, height: 36, borderRadius: 24, background: '#0A0C0A', zIndex: 80,
      }} />
      {/* status bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
        height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 30px', paddingTop: 18,
      }}>
        <span style={{
          fontFamily: '-apple-system, "SF Pro", system-ui',
          fontSize: 16, fontWeight: 600,
          color: dark ? '#fff' : 'var(--ink)',
        }}>9:41</span>
        <div style={{ width: 80 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6,
          color: dark ? '#fff' : 'var(--ink)' }}>
          <svg width="17" height="11" viewBox="0 0 17 11">
            <rect x="0" y="7" width="3" height="4" rx="0.7" fill="currentColor"/>
            <rect x="4.5" y="5" width="3" height="6" rx="0.7" fill="currentColor"/>
            <rect x="9" y="2.5" width="3" height="8.5" rx="0.7" fill="currentColor"/>
            <rect x="13.5" y="0" width="3" height="11" rx="0.7" fill="currentColor"/>
          </svg>
          <svg width="24" height="12" viewBox="0 0 25 12">
            <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="currentColor" strokeOpacity="0.4" fill="none"/>
            <rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor"/>
            <path d="M23 4 V8 C23.7 7.7 24.2 6.9 24.2 6 C24.2 5.1 23.7 4.3 23 4 Z" fill="currentColor" opacity="0.5"/>
          </svg>
        </div>
      </div>
      {/* content */}
      <div className="alt-screen" style={{ width: '100%', height: '100%' }}>
        {children}
      </div>
      {/* home indicator */}
      <div style={{
        position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
        width: 134, height: 5, borderRadius: 100,
        background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.32)',
        zIndex: 90,
      }} />
    </div>
  );
}

// ── Top bar within a screen ───────────────────────────────────────────────
function TopBar({ title, subtitle, leading, trailing, sticky = true, large = false, eyebrow }) {
  return (
    <div style={{
      paddingTop: 58, paddingLeft: 20, paddingRight: 20, paddingBottom: 10,
      background: 'var(--bone)',
      position: sticky ? 'sticky' : 'relative', top: 0, zIndex: 20,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        minHeight: 36, gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{leading}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{trailing}</div>
      </div>
      {eyebrow && <div className="alt-eyebrow" style={{ marginTop: 14 }}>{eyebrow}</div>}
      {title && (
        <div className="alt-display" style={{
          fontSize: large ? 36 : 28,
          marginTop: eyebrow ? 4 : 14,
          color: 'var(--ink)',
          fontStyle: large ? 'italic' : 'normal',
        }}>{title}</div>
      )}
      {subtitle && (
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>{subtitle}</div>
      )}
    </div>
  );
}

// ── Round icon button (header/trailing) ────────────────────────────────────
function IconButton({ icon, onClick, badge, label }) {
  return (
    <button type="button" onClick={onClick}
      aria-label={label}
      className="alt-tap"
      style={{
        appearance: 'none', width: 36, height: 36, borderRadius: 999,
        border: '1px solid var(--line)', background: 'var(--paper)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--ink-2)', position: 'relative',
      }}>
      {icon}
      {badge && (
        <span style={{
          position: 'absolute', top: -2, right: -2,
          minWidth: 14, height: 14, padding: '0 4px',
          background: 'var(--clay)', color: '#fff',
          borderRadius: 999, fontSize: 9, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          border: '1.5px solid var(--bone)',
        }}>{badge}</span>
      )}
    </button>
  );
}

Object.assign(window, {
  Wordmark, Monogram, StatePill, StateCell, nextState,
  AIBadge, Button, Avatar, PropertyHero, StageRail,
  SectionLabel, TabBar, Icon, PhoneShell, TopBar, IconButton,
  STATE_CFG,
});
