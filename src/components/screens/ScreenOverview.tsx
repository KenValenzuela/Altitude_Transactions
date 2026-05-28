'use client';
import type { GoFn } from '@/types';
import { ALT_DATA } from '@/data';
import { AIBadge } from '@/components/ui/AIBadge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/icons';
import { IconButton } from '@/components/ui/IconButton';
import { PropertyHero } from '@/components/ui/PropertyHero';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { StageRail } from '@/components/ui/StageRail';
import { StateCell } from '@/components/ui/StateCell';

export function ScreenOverview({ go }: { go: GoFn }) {
  const d = ALT_DATA;
  const p = d.property;
  const all = d.checklist.flatMap(g => g.items);
  const done = all.filter(x => x.state === 'done').length;
  const na   = all.filter(x => x.state === 'na').length;
  const doing = all.filter(x => x.state === 'doing').length;
  const todo  = all.filter(x => x.state === 'todo').length;
  const active = all.length - na;
  const pct = Math.round((done / active) * 100);

  return (
    <div className="alt-screen-body alt-scroll" style={{ paddingBottom: 120 }}>
      {/* Hero header */}
      <div style={{ position: 'relative', padding: '50px 12px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 8px 12px' }}>
          <IconButton icon={Icon.back()} onClick={() => go('dashboard')} label="Back"/>
          <div style={{
            fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'var(--ink-3)',
          }}>Transaction · #2403</div>
          <IconButton icon={Icon.bell()} label="Updates"/>
        </div>
        <PropertyHero property={p} height={170}/>
      </div>

      {/* Money strip */}
      <div style={{ padding: '14px 20px 8px', display: 'flex', gap: 10 }}>
        {[
          { l: 'Price',   v: '$962,500', m: 'Contract' },
          { l: 'Earnest', v: '$28,000',  m: 'Held · Heritage' },
          { l: 'Close',   v: 'May 01',   m: '15 days' },
        ].map((s, i) => (
          <div key={i} className="alt-card" style={{ flex: 1, padding: '10px 12px' }}>
            <div className="alt-eyebrow" style={{ fontSize: 9 }}>{s.l}</div>
            <div className="alt-display" style={{ fontSize: 18, marginTop: 4, fontStyle: 'italic' }}>{s.v}</div>
            <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{s.m}</div>
          </div>
        ))}
      </div>

      <SectionLabel>Stage</SectionLabel>
      <div className="alt-card" style={{ margin: '0 20px', padding: '12px 0' }}>
        <StageRail stages={d.stages}/>
        <div style={{ padding: '6px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-3)' }}>
          <span>Currently <span style={{ color: 'var(--gold)', fontWeight: 600 }}>Appraisal</span></span>
          <span>Day 18 of 30</span>
        </div>
      </div>

      <SectionLabel action="See all">Today</SectionLabel>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { t: 'Septic inspection — confirm 9am arrival',  s: 'Friday · High Country',        state: 'doing' as const, ai: false },
          { t: 'Send appraisal nudge to First Western',    s: 'Drafted by AI · review & send', state: 'todo' as const,  ai: true  },
          { t: 'Title commitment review w/ buyer',         s: 'Schedule 15-min call',           state: 'doing' as const, ai: false },
        ].map((it, i) => (
          <div key={i} className="alt-card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <StateCell state={it.state}/>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{it.t}</div>
                {it.ai && <AIBadge/>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{it.s}</div>
            </div>
            <div style={{ color: 'var(--ink-3)' }}>{Icon.chevR()}</div>
          </div>
        ))}
      </div>

      <SectionLabel>Progress</SectionLabel>
      <div className="alt-card" style={{ margin: '0 20px', padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div className="alt-display" style={{ fontSize: 36, fontStyle: 'italic' }}>
            {pct}<span style={{ fontSize: 20, color: 'var(--ink-3)' }}>%</span>
          </div>
          <div className="alt-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
            {done}/{active} active items
          </div>
        </div>
        <div style={{ marginTop: 12, height: 8, borderRadius: 999, background: 'var(--paper-2)', overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${(done / active) * 100}%`, background: 'var(--sage)' }}/>
          <div style={{ width: `${(doing / active) * 100}%`, background: 'var(--gold)' }}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 11, color: 'var(--ink-3)' }}>
          <span><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 999, background: 'var(--sage)', marginRight: 4 }}/>{done} done</span>
          <span><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 999, background: 'var(--gold)', marginRight: 4 }}/>{doing} in progress</span>
          <span><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 999, background: 'var(--slate)', marginRight: 4 }}/>{todo} to do</span>
          <span><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 999, background: 'var(--na)', marginRight: 4 }}/>{na} N/A</span>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ padding: '18px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { t: 'Checklist', s: `${active} active`,       to: 'checklist', accent: 'var(--ink)' },
          { t: 'Deadlines', s: 'Next: Apr 22',           to: 'deadlines', accent: 'var(--gold)' },
          { t: 'Parties',   s: '6 contacts',             to: 'parties',   accent: 'var(--sage)' },
          { t: 'Documents', s: '7 received · 3 pending', to: 'documents', accent: 'var(--clay)' },
        ].map((a) => (
          <button key={a.t} type="button" onClick={() => go(a.to as Parameters<GoFn>[0])}
            className="alt-card alt-tap"
            style={{ appearance: 'none', border: '1px solid var(--line)', background: 'var(--paper)', padding: 14, textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ width: 8, height: 8, borderRadius: 999, background: a.accent }}/>
              <div style={{ color: 'var(--ink-3)' }}>{Icon.chevR()}</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, marginTop: 18 }}>{a.t}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{a.s}</div>
          </button>
        ))}
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <Button full variant="sage" onClick={() => go('summary')}>View this week&apos;s summary</Button>
      </div>
    </div>
  );
}
