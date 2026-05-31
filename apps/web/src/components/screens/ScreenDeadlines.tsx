'use client';
import { useState } from 'react';
import type { GoFn } from '@/types';
import type { ApiDeadline } from '@/types/api';
import { FIXTURE_DETAIL } from '@/lib/fixtures';
import { splitDate, daysUntil, formatDateShort } from '@/lib/format';
import { Icon } from '@/components/ui/icons';
import { IconButton } from '@/components/ui/IconButton';
import { TopBar } from '@/components/ui/TopBar';

type DeadlineView = 'timeline' | 'month';

interface ScreenDeadlinesProps {
  go: GoFn;
  deadlines?: ApiDeadline[];
  closeDate?: string | null;
  daysToClose?: number;
  title?: string;
}

export function ScreenDeadlines({
  go,
  deadlines = FIXTURE_DETAIL.deadlines,
  closeDate = FIXTURE_DETAIL.money.closeDate,
  daysToClose = FIXTURE_DETAIL.money.daysToClose,
  title = 'Deadlines',
}: ScreenDeadlinesProps) {
  const [view, setView] = useState<DeadlineView>('timeline');

  // Only dated, applicable deadlines, sorted chronologically.
  const dated = deadlines
    .filter((d) => !d.isNa && d.date)
    .sort((a, b) => (a.date! < b.date! ? -1 : 1));

  // Anchor the month grid on the first deadline's month.
  const anchor = dated[0]?.date ? new Date(`${dated[0].date}T00:00:00`) : new Date();
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const monthName = anchor.toLocaleDateString('en-US', { month: 'long' });
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let dt = 1; dt <= daysInMonth; dt++) cells.push(dt);

  const eventByDay: Record<number, ApiDeadline> = {};
  dated.forEach((d) => {
    const dd = new Date(`${d.date}T00:00:00`);
    if (dd.getFullYear() === year && dd.getMonth() === month) eventByDay[dd.getDate()] = d;
  });

  return (
    <>
      <TopBar
        eyebrow={title}
        title="Deadlines"
        leading={<IconButton icon={Icon.back()} onClick={() => go('overview')} label="Back" />}
      />

      <div style={{ padding: '0 20px 12px' }}>
        <div style={{ display: 'inline-flex', padding: 3, borderRadius: 999, background: 'var(--paper-2)', border: '1px solid var(--line)' }}>
          {([{ id: 'timeline' as const, l: 'Timeline' }, { id: 'month' as const, l: 'Month' }]).map((v) => (
            <button key={v.id} type="button" onClick={() => setView(v.id)} className="alt-tap"
              style={{
                appearance: 'none', height: 28, padding: '0 14px', borderRadius: 999,
                background: view === v.id ? 'var(--paper)' : 'transparent',
                color: view === v.id ? 'var(--ink)' : 'var(--ink-3)',
                border: 0, fontSize: 12, fontWeight: 500,
                boxShadow: view === v.id ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
              }}>
              {v.l}
            </button>
          ))}
        </div>
      </div>

      <div className="alt-screen-body alt-scroll" style={{ padding: '0 20px 40px' }}>
        {dated.length === 0 && (
          <div className="alt-card" style={{ padding: 16, fontSize: 13, color: 'var(--ink-3)' }}>
            No dated deadlines yet. They appear once a contract is confirmed.
          </div>
        )}

        {view === 'timeline' && dated.length > 0 && (
          <>
            <div className="alt-card" style={{
              padding: 18, background: 'var(--ink)', color: 'var(--paper)',
              border: 0, position: 'relative', overflow: 'hidden', marginBottom: 14,
            }}>
              <svg style={{ position: 'absolute', right: -20, top: -20, opacity: 0.12 }} width="160" height="160" viewBox="0 0 160 160">
                <path d="M0 130 L40 80 L70 100 L120 50 L160 90 L160 160 L0 160 Z" fill="#F4EFE3" />
              </svg>
              <div className="alt-eyebrow" style={{ color: 'rgba(244,239,227,.55)' }}>Closing in</div>
              <div className="alt-display" style={{ fontSize: 64, fontStyle: 'italic', lineHeight: 1, marginTop: 6, color: '#F4EFE3' }}>
                {daysToClose}<span style={{ fontSize: 22, fontStyle: 'normal' }}>d</span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(244,239,227,.7)', marginTop: 6 }}>
                  {formatDateShort(closeDate ?? null)} · Settlement
              </div>
            </div>

            <div style={{ position: 'relative', paddingLeft: 22 }}>
              <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 1.5, background: 'var(--line)' }} />
              {dated.map((e) => {
                  const {mon, day, dow} = splitDate(e.date ?? null);
                  const until = daysUntil(e.date ?? null);
                return (
                  <div key={e.id} style={{ position: 'relative', paddingBottom: 14 }}>
                    <div style={{
                      position: 'absolute', left: -22, top: 4,
                      width: 16, height: 16, borderRadius: 999,
                      background: e.isUrgent ? 'var(--clay)' : 'var(--paper)',
                      border: `2px solid ${e.isUrgent ? 'var(--clay)' : 'var(--line-strong)'}`,
                      boxShadow: e.isUrgent ? '0 0 0 4px rgba(184,98,74,.16)' : 'none',
                    }} />
                    <div className="alt-card" style={{
                      padding: 12,
                      borderColor: e.isUrgent ? 'rgba(184,98,74,.3)' : 'var(--line)',
                      background: e.isUrgent ? '#FBF1ED' : 'var(--paper)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div className="alt-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{dow} · {mon} {day}</div>
                        {until !== null && (
                          <div style={{ fontSize: 10, color: e.isUrgent ? 'var(--clay)' : 'var(--ink-3)', fontFamily: 'var(--f-mono)', fontWeight: 500 }}>
                            {until >= 0 ? `in ${until}d` : `${Math.abs(until)}d ago`}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>{e.event}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                        <span className="alt-pill" style={{ background: 'var(--paper-2)', color: 'var(--ink-3)', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          {e.sectionReference}
                        </span>
                        {e.isUrgent && (
                          <span className="alt-pill" style={{ background: 'var(--clay-soft)', color: 'var(--clay)' }}>
                            <span style={{ color: 'var(--clay)' }}>{Icon.alert()}</span>
                            Priority
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {view === 'month' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 4px 10px' }}>
              <div className="alt-display" style={{ fontSize: 22, fontStyle: 'italic' }}>{monthName}</div>
              <div className="alt-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{year}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} style={{ textAlign: 'center', fontSize: 10, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)', letterSpacing: '0.1em' }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {cells.map((dt, i) => {
                const ev = dt !== null ? eventByDay[dt] : undefined;
                return (
                  <div key={i} className={dt ? 'alt-tap' : ''} style={{
                    aspectRatio: '1 / 1', borderRadius: 8,
                    background: !dt ? 'transparent' : ev?.isUrgent ? 'var(--clay-soft)' : ev ? 'var(--paper)' : 'var(--paper-2)',
                    color: !dt ? 'transparent' : ev?.isUrgent ? 'var(--clay)' : 'var(--ink-2)',
                    border: ev ? `1px solid ${ev.isUrgent ? 'var(--clay)' : 'var(--line)'}` : '1px solid transparent',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'flex-start', justifyContent: 'space-between',
                    padding: '4px 5px', position: 'relative',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: ev ? 600 : 400 }}>{dt || ''}</div>
                    {ev && (
                      <div style={{ width: '100%', fontSize: 8, lineHeight: 1.1, letterSpacing: '0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                          {(ev.event ?? ev.eventName).split(' ')[0]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 16 }}>
              <div className="alt-eyebrow" style={{ padding: '0 4px 8px' }}>Upcoming</div>
              <div className="alt-card" style={{ padding: 0 }}>
                {dated.slice(0, 4).map((e, i, a) => (
                  <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i < a.length - 1 ? '0.5px solid var(--line)' : 'none' }}>
                      <div className="alt-mono" style={{
                          fontSize: 11,
                          color: 'var(--ink-3)',
                          minWidth: 48
                      }}>{formatDateShort(e.date ?? null)}</div>
                    <div style={{ flex: 1, fontSize: 13 }}>{e.event}</div>
                    {e.isUrgent && <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--clay)', display: 'inline-block' }} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
