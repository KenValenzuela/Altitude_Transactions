'use client';
import type { GoFn } from '@/types';
import type { TransactionDetail } from '@/types/api';
import { DEMO_DETAIL } from '@/lib/fixtures';
import { formatDateShort, daysUntil } from '@/lib/format';
import { AIBadge } from '@/components/ui/AIBadge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/icons';
import { IconButton } from '@/components/ui/IconButton';
import { TopBar } from '@/components/ui/TopBar';

/**
 * The weekly summary is *derived* from the transaction (not faked): completed
 * tasks, the next upcoming deadlines, and urgent items as the watch list. This
 * is the honest MVP — a real product would let the broker edit the AI draft.
 */
export function ScreenSummary({ go, detail = DEMO_DETAIL }: { go: GoFn; detail?: TransactionDetail }) {
  const allTasks = detail.tasks.flatMap((g) => g.items).filter((t) => !t.isPostClose);
  const completed = allTasks.filter((t) => t.state === 'done').map((t) => t.title);
  const upcoming = detail.deadlines
    .filter((d) => !d.isNa && d.date && (daysUntil(d.date) ?? -1) >= 0)
    .sort((a, b) => (a.date! < b.date! ? -1 : 1))
    .slice(0, 5);
  const risks = detail.deadlines.filter((d) => d.isUrgent && !d.isNa);

  return (
    <>
      <TopBar
        eyebrow="Weekly summary"
        title="Summary"
        leading={<IconButton icon={Icon.back()} onClick={() => go('overview')} label="Back"/>}
        trailing={<AIBadge size="lg" label="AI · Draft"/>}
      />
      <div className="alt-screen-body alt-scroll" style={{ padding: '0 20px 110px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 4px 14px' }}>
          <div>
            <div className="alt-eyebrow">Transaction</div>
            <div className="alt-display" style={{ fontSize: 22, fontStyle: 'italic', marginTop: 2 }}>{detail.address}</div>
          </div>
        </div>

        <div className="alt-card" style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { l: 'Completed', v: completed.length, c: 'var(--sage-deep)' },
            { l: 'Upcoming', v: upcoming.length, c: 'var(--gold)' },
            { l: 'Watch', v: risks.length, c: 'var(--clay)' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'left', borderRight: i < 2 ? '0.5px solid var(--line)' : 'none', paddingRight: i < 2 ? 10 : 0 }}>
              <div className="alt-eyebrow" style={{ fontSize: 9 }}>{s.l}</div>
              <div className="alt-display" style={{ fontSize: 32, fontStyle: 'italic', color: s.c, marginTop: 4 }}>{s.v}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 22 }}>
          <div className="alt-eyebrow" style={{ marginBottom: 8 }}>
            <span style={{ color: 'var(--sage-deep)' }}>● </span>Completed
          </div>
          <div className="alt-card" style={{ padding: 0 }}>
            {completed.length === 0 && <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--ink-3)' }}>Nothing completed yet.</div>}
            {completed.map((c, i, a) => (
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
            {upcoming.length === 0 && <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--ink-3)' }}>No upcoming deadlines.</div>}
            {upcoming.map((d, i, a) => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: i < a.length - 1 ? '0.5px solid var(--line)' : 'none' }}>
                  <div className="alt-mono" style={{
                      fontSize: 11,
                      color: 'var(--ink-3)',
                      minWidth: 76
                  }}>{formatDateShort(d.date ?? null)}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', flex: 1 }}>{d.event}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div className="alt-eyebrow" style={{ marginBottom: 8 }}>
            <span style={{ color: 'var(--clay)' }}>● </span>Watch list
          </div>
          <div className="alt-card" style={{ padding: 0 }}>
            {risks.length === 0 && <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--ink-3)' }}>Nothing flagged.</div>}
            {risks.map((r, i, a) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderBottom: i < a.length - 1 ? '0.5px solid var(--line)' : 'none' }}>
                <span style={{ color: 'var(--clay)', flexShrink: 0, marginTop: 2 }}>{Icon.alert()}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.45 }}>{r.event}</div>
                  <div className="alt-mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {r.sectionReference} · {formatDateShort(r.date ?? null)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 22, fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)', textAlign: 'center', letterSpacing: '0.06em' }}>
          drafted by altitude · review before sending
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
