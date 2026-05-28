'use client';
import type { GoFn } from '@/types';
import { ALT_DATA } from '@/data';
import { AIBadge } from '@/components/ui/AIBadge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/icons';
import { IconButton } from '@/components/ui/IconButton';
import { TopBar } from '@/components/ui/TopBar';

export function ScreenSummary({ go }: { go: GoFn }) {
  const d = ALT_DATA;
  return (
    <>
      <TopBar
        eyebrow="Pine Ridge Trail · Weekly"
        title="Summary"
        leading={<IconButton icon={Icon.back()} onClick={() => go('overview')} label="Back"/>}
        trailing={<AIBadge size="lg" label="AI · Draft"/>}
      />
      <div className="alt-screen-body alt-scroll" style={{ padding: '0 20px 110px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 4px 14px' }}>
          <div>
            <div className="alt-eyebrow">Week of</div>
            <div className="alt-display" style={{ fontSize: 22, fontStyle: 'italic', marginTop: 2 }}>{d.summary.week}</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['‹','›'].map(ch => (
              <button key={ch} type="button" className="alt-tap" style={{
                appearance: 'none', width: 30, height: 30, borderRadius: 999,
                border: '1px solid var(--line)', background: 'var(--paper)', color: 'var(--ink-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{ch}</button>
            ))}
          </div>
        </div>

        {/* Glance card */}
        <div className="alt-card" style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { l: 'Completed', v: d.summary.completed.length, c: 'var(--sage-deep)' },
            { l: 'Upcoming',  v: d.summary.upcoming.length,  c: 'var(--gold)' },
            { l: 'Risks',     v: d.summary.risks.length,     c: 'var(--clay)' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'left', borderRight: i < 2 ? '0.5px solid var(--line)' : 'none', paddingRight: i < 2 ? 10 : 0 }}>
              <div className="alt-eyebrow" style={{ fontSize: 9 }}>{s.l}</div>
              <div className="alt-display" style={{ fontSize: 32, fontStyle: 'italic', color: s.c, marginTop: 4 }}>{s.v}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 22 }}>
          <div className="alt-eyebrow" style={{ marginBottom: 8 }}>
            <span style={{ color: 'var(--sage-deep)' }}>● </span>Completed this week
          </div>
          <div className="alt-card" style={{ padding: 0 }}>
            {d.summary.completed.map((c, i, a) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderBottom: i < a.length - 1 ? '0.5px solid var(--line)' : 'none' }}>
                <span style={{ color: 'var(--sage)', flexShrink: 0, marginTop: 1 }}>{Icon.check()}</span>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.45 }}>{c}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div className="alt-eyebrow" style={{ marginBottom: 8 }}>
            <span style={{ color: 'var(--gold)' }}>● </span>Upcoming deadlines
          </div>
          <div className="alt-card" style={{ padding: 0 }}>
            {d.summary.upcoming.map((c, i, a) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: i < a.length - 1 ? '0.5px solid var(--line)' : 'none' }}>
                <div className="alt-mono" style={{ fontSize: 11, color: 'var(--ink-3)', minWidth: 76 }}>{c.d}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', flex: 1 }}>{c.t}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div className="alt-eyebrow" style={{ marginBottom: 8 }}>
            <span style={{ color: 'var(--clay)' }}>● </span>Watch list
          </div>
          <div className="alt-card" style={{ padding: 0 }}>
            {d.summary.risks.map((r, i, a) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderBottom: i < a.length - 1 ? '0.5px solid var(--line)' : 'none' }}>
                <span style={{ color: 'var(--clay)', flexShrink: 0, marginTop: 2 }}>{Icon.alert()}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.45 }}>{r.t}</div>
                  <div className="alt-mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {r.sev === 'med' ? 'Medium' : 'Low'} priority
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 22, padding: 14, borderRadius: 'var(--r-md)', background: 'var(--sage-tint)', border: '0.5px solid rgba(30,58,102,.22)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <AIBadge size="lg"/>
          <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5 }}>
            <span style={{ fontWeight: 500, color: 'var(--ink)' }}>What I&apos;d watch this week.</span>{' '}
            Appraisal arrival on Tuesday is the lynchpin — every closing date after it depends on a clean number. I&apos;d lean on First Western Monday morning rather than wait.
          </div>
        </div>

        <div style={{ marginTop: 22, fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)', textAlign: 'center', letterSpacing: '0.06em' }}>
          drafted by altitude · reviewed by brett morales · {d.summary.week}
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 12, right: 12, bottom: 24, zIndex: 30,
        padding: '12px 14px', borderRadius: 22,
        background: 'rgba(250,247,240,0.9)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '0.5px solid var(--line)', boxShadow: 'var(--sh-2)',
        display: 'flex', gap: 8,
      }}>
        <Button variant="secondary" full>Edit draft</Button>
        <Button variant="sage" full onClick={() => go('postclose')}>Send to buyer &amp; seller</Button>
      </div>
    </>
  );
}
