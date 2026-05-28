'use client';
import { useState } from 'react';
import type { GoFn } from '@/types';
import { ALT_DATA } from '@/data';
import { Icon } from '@/components/ui/icons';
import { IconButton } from '@/components/ui/IconButton';
import { TopBar } from '@/components/ui/TopBar';

type DeadlineView = 'timeline' | 'month';

export function ScreenDeadlines({ go }: { go: GoFn }) {
  const d = ALT_DATA;
  const [view, setView] = useState<DeadlineView>('timeline');

  const month = (() => {
    const days: (number | null)[] = [];
    const firstDow = 1; // Mon
    for (let i = 0; i < firstDow; i++) days.push(null);
    for (let dt = 1; dt <= 30; dt++) days.push(dt);
    return days;
  })();

  const eventByDay: Record<number, typeof d.deadlines[0]> = {};
  d.deadlines.forEach(e => {
    const day = parseInt(e.date.split(' ')[1], 10);
    if (e.date.startsWith('Apr')) eventByDay[day] = e;
  });

  return (
    <>
      <TopBar
        eyebrow="Pine Ridge Trail"
        title="Deadlines"
        leading={<IconButton icon={Icon.back()} onClick={() => go('overview')} label="Back"/>}
      />

      {/* view switcher */}
      <div style={{ padding: '0 20px 12px' }}>
        <div style={{ display: 'inline-flex', padding: 3, borderRadius: 999, background: 'var(--paper-2)', border: '1px solid var(--line)' }}>
          {([{ id: 'timeline' as const, l: 'Timeline' }, { id: 'month' as const, l: 'Month' }]).map(v => (
            <button key={v.id} type="button" onClick={() => setView(v.id)}
              className="alt-tap"
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
        {view === 'timeline' && (
          <>
            <div className="alt-card" style={{
              padding: 18, background: 'var(--ink)', color: 'var(--paper)',
              border: 0, position: 'relative', overflow: 'hidden', marginBottom: 14,
            }}>
              <svg style={{ position: 'absolute', right: -20, top: -20, opacity: 0.12 }} width="160" height="160" viewBox="0 0 160 160">
                <path d="M0 130 L40 80 L70 100 L120 50 L160 90 L160 160 L0 160 Z" fill="#F4EFE3"/>
              </svg>
              <div className="alt-eyebrow" style={{ color: 'rgba(244,239,227,.55)' }}>Closing in</div>
              <div className="alt-display" style={{ fontSize: 64, fontStyle: 'italic', lineHeight: 1, marginTop: 6, color: '#F4EFE3' }}>
                15<span style={{ fontSize: 22, fontStyle: 'normal' }}>d</span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(244,239,227,.7)', marginTop: 6 }}>
                May 01 · 10:00 AM · Heritage Title Co.
              </div>
            </div>

            <div style={{ position: 'relative', paddingLeft: 22 }}>
              <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 1.5, background: 'var(--line)' }}/>
              {d.deadlines.map((e, i) => (
                <div key={i} style={{ position: 'relative', paddingBottom: 14 }}>
                  <div style={{
                    position: 'absolute', left: -22, top: 4,
                    width: 16, height: 16, borderRadius: 999,
                    background: e.urgent ? 'var(--clay)' : 'var(--paper)',
                    border: `2px solid ${e.urgent ? 'var(--clay)' : 'var(--line-strong)'}`,
                    boxShadow: e.urgent ? '0 0 0 4px rgba(184,98,74,.16)' : 'none',
                  }}/>
                  <div className="alt-card" style={{
                    padding: 12,
                    borderColor: e.urgent ? 'rgba(184,98,74,.3)' : 'var(--line)',
                    background: e.urgent ? '#FBF1ED' : 'var(--paper)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div className="alt-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{e.day} · {e.date}</div>
                      <div style={{ fontSize: 10, color: e.urgent ? 'var(--clay)' : 'var(--ink-3)', fontFamily: 'var(--f-mono)', fontWeight: 500 }}>
                        in {e.days}d
                      </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>{e.label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <span className="alt-pill" style={{ background: 'var(--paper-2)', color: 'var(--ink-3)', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        {e.tag}
                      </span>
                      {e.urgent && (
                        <span className="alt-pill" style={{ background: 'var(--clay-soft)', color: 'var(--clay)' }}>
                          <span style={{ color: 'var(--clay)' }}>{Icon.alert()}</span>
                          Priority
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {view === 'month' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 4px 10px' }}>
              <div className="alt-display" style={{ fontSize: 22, fontStyle: 'italic' }}>April</div>
              <div className="alt-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>2024</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
              {['S','M','T','W','T','F','S'].map((day, i) => (
                <div key={i} style={{ textAlign: 'center', fontSize: 10, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)', letterSpacing: '0.1em' }}>
                  {day}
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {month.map((dt, i) => {
                const ev = dt !== null ? eventByDay[dt] : undefined;
                const isToday = dt === 16;
                return (
                  <div key={i} className={dt ? 'alt-tap' : ''} style={{
                    aspectRatio: '1 / 1', borderRadius: 8,
                    background: !dt ? 'transparent' : ev?.urgent ? 'var(--clay-soft)' : ev ? 'var(--paper)' : isToday ? 'var(--ink)' : 'var(--paper-2)',
                    color: !dt ? 'transparent' : ev?.urgent ? 'var(--clay)' : isToday ? 'var(--paper)' : 'var(--ink-2)',
                    border: ev ? `1px solid ${ev.urgent ? 'var(--clay)' : 'var(--line)'}` : '1px solid transparent',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'flex-start', justifyContent: 'space-between',
                    padding: '4px 5px', position: 'relative',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: isToday || ev ? 600 : 400 }}>{dt || ''}</div>
                    {ev && (
                      <div style={{ width: '100%', fontSize: 8, lineHeight: 1.1, letterSpacing: '0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                        {ev.label.split(' ')[0]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 16 }}>
              <div className="alt-eyebrow" style={{ padding: '0 4px 8px' }}>Upcoming</div>
              <div className="alt-card" style={{ padding: 0 }}>
                {d.deadlines.slice(0, 4).map((e, i, a) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i < a.length - 1 ? '0.5px solid var(--line)' : 'none' }}>
                    <div className="alt-mono" style={{ fontSize: 11, color: 'var(--ink-3)', minWidth: 48 }}>{e.date}</div>
                    <div style={{ flex: 1, fontSize: 13 }}>{e.label}</div>
                    {e.urgent && <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--clay)', display: 'inline-block' }}/>}
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
