'use client';
import type { GoFn, ChecklistState } from '@/types';
import type { TransactionDetail } from '@/types/api';
import { FIXTURE_DETAIL } from '@/lib/fixtures';
import { formatPrice, formatDateShort } from '@/lib/format';
import { AIBadge } from '@/components/ui/AIBadge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/icons';
import { IconButton } from '@/components/ui/IconButton';
import { PropertyHero } from '@/components/ui/PropertyHero';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { StageRail } from '@/components/ui/StageRail';
import { StateCell } from '@/components/ui/StateCell';

const STATUS_LABELS: Record<TransactionDetail['status'], string> = {
    draft: 'Draft',
  under_contract: 'Under Contract',
    in_review: 'Under Review',
    active: 'Active',
    closing: 'Closing',
  closed: 'Closed',
    cancelled: 'Cancelled',
};

const STATUS_ORDER: TransactionDetail['status'][] = [
    'under_contract', 'in_review', 'active', 'closing', 'closed',
];

function deriveStages(status: TransactionDetail['status']) {
    const currentIdx = STATUS_ORDER.indexOf(status);
    return STATUS_ORDER.map((s, i) => ({
        id: s,
        label: STATUS_LABELS[s],
        done: i < currentIdx,
        current: i === currentIdx,
    }));
}

export function ScreenOverview({ go, detail = FIXTURE_DETAIL }: { go: GoFn; detail?: TransactionDetail }) {
  const { done, doing, todo, na, active } = detail.counts;
  const pct = active > 0 ? Math.round((done / active) * 100) : 0;
    const stages = deriveStages(detail.status);
    const currentStageIndex = stages.findIndex((s) => s.current);
  const pending = detail.tasks
    .flatMap((g) => g.items)
    .filter((t) => !t.isPostClose && (t.state === 'doing' || t.state === 'todo'))
    .slice(0, 3);

  const nextDeadline = detail.deadlines
    .filter((dl) => !dl.isNa && dl.date)
    .sort((a, b) => (a.date! < b.date! ? -1 : 1))[0];
    const nextDeadlineLabel = nextDeadline ? `Next: ${formatDateShort(nextDeadline.date ?? null)}` : 'None scheduled';
    const docs = detail.documents ?? [];
    const receivedCount = docs.filter((dc) => dc.state === 'received').length;
    const pendingCount = docs.filter((dc) => dc.state === 'pending').length;

  return (
    <div className="alt-screen-body alt-scroll" style={{ paddingBottom: 120 }}>
      {/* Hero header */}
      <div style={{ position: 'relative', padding: '50px 12px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 8px 12px' }}>
          <IconButton icon={Icon.back()} onClick={() => go('dashboard')} label="Back"/>
          <div style={{
            fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'var(--ink-3)',
          }}>{detail.city}</div>
          <IconButton icon={Icon.bell()} label="Updates"/>
        </div>
        <PropertyHero
            property={{address: detail.address, city: detail.city, type: '', mls: ''}}
          height={170}
        />
      </div>

      {/* Money strip */}
      <div style={{ padding: '14px 20px 8px', display: 'flex', gap: 10 }}>
        {[
          { l: 'Price',   v: formatPrice(detail.money.price), m: 'Contract' },
          { l: 'Earnest', v: formatPrice(detail.money.earnest),  m: 'In escrow' },
            {l: 'Close', v: formatDateShort(detail.money.closeDate ?? null), m: `${detail.money.daysToClose} days`},
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
          <StageRail stages={stages}/>
        <div style={{ padding: '6px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-3)' }}>
          <span>Currently <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{STATUS_LABELS[detail.status]}</span></span>
            {currentStageIndex >= 0 && <span>Stage {currentStageIndex + 1} of {stages.length}</span>}
        </div>
      </div>

      <SectionLabel action="See all">Today</SectionLabel>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {pending.length === 0 && (
          <div className="alt-card" style={{ padding: 14, fontSize: 13, color: 'var(--ink-3)' }}>
            Nothing open right now. Every active item is complete.
          </div>
        )}
        {pending.map((it) => (
          <button key={it.id} type="button" onClick={() => go('checklist')}
            className="alt-card alt-tap"
            style={{ appearance: 'none', width: '100%', textAlign: 'left', border: '1px solid var(--line)', background: 'var(--paper)', padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <StateCell state={it.state as ChecklistState}/>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{it.title}</div>
                {it.aiNote && <AIBadge/>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{it.aiNote ?? `${it.group} · due ${it.due}`}</div>
            </div>
            <div style={{ color: 'var(--ink-3)' }}>{Icon.chevR()}</div>
          </button>
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
          <div style={{ width: `${active > 0 ? (done / active) * 100 : 0}%`, background: 'var(--sage)' }}/>
          <div style={{ width: `${active > 0 ? (doing / active) * 100 : 0}%`, background: 'var(--gold)' }}/>
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
          { t: 'Checklist', s: `${active} active`, to: 'checklist', accent: 'var(--ink)' },
          { t: 'Deadlines', s: nextDeadlineLabel, to: 'deadlines', accent: 'var(--gold)' },
            {t: 'Parties', s: `${(detail.parties ?? []).length} contacts`, to: 'parties', accent: 'var(--sage)'},
          { t: 'Documents', s: `${receivedCount} received · ${pendingCount} pending`, to: 'documents', accent: 'var(--clay)' },
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
