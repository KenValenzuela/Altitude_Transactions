'use client';
import { useState } from 'react';
import type { GoFn, ChecklistGroup, ChecklistState } from '@/types';
import { ALT_DATA } from '@/data';
import { STATE_CFG, nextState } from '@/lib/state';
import { AIBadge } from '@/components/ui/AIBadge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/icons';
import { IconButton } from '@/components/ui/IconButton';
import { StateCell } from '@/components/ui/StateCell';
import { TopBar } from '@/components/ui/TopBar';

type FilterKey = 'all' | 'active' | 'done' | 'na';

export function ScreenChecklist({ go }: { go: GoFn }) {
  const [groups, setGroups] = useState<ChecklistGroup[]>(ALT_DATA.checklist);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [openItem, setOpenItem] = useState<string | null>(null);

  const cycle = (gIdx: number, iIdx: number) => {
    setGroups(prev => prev.map((g, gi) => gi !== gIdx ? g : {
      ...g, items: g.items.map((it, ii) => ii !== iIdx ? it : { ...it, state: nextState(it.state) }),
    }));
  };

  const visible = (state: ChecklistState) => {
    if (filter === 'all') return state !== 'na';
    if (filter === 'active') return state === 'todo' || state === 'doing';
    if (filter === 'done') return state === 'done';
    if (filter === 'na') return state === 'na';
    return true;
  };

  const all = groups.flatMap(g => g.items);
  const counts = {
    all:    all.filter(x => x.state !== 'na').length,
    active: all.filter(x => x.state === 'todo' || x.state === 'doing').length,
    done:   all.filter(x => x.state === 'done').length,
    na:     all.filter(x => x.state === 'na').length,
  };

  return (
    <>
      <TopBar
        eyebrow="Pine Ridge Trail · Contract to close"
        title="Checklist"
        leading={<IconButton icon={Icon.back()} onClick={() => go('overview')} label="Back"/>}
        trailing={<IconButton icon={Icon.plus()} label="Add task"/>}
      />

      {/* filter chips */}
      <div style={{ padding: '0 20px 12px', display: 'flex', gap: 8, overflowX: 'auto' }} className="alt-scroll">
        {([
          { id: 'all',    l: 'All',        n: counts.all },
          { id: 'active', l: 'Active',     n: counts.active },
          { id: 'done',   l: 'Done',       n: counts.done },
          { id: 'na',     l: 'N/A hidden', n: counts.na },
        ] as const).map(f => {
          const on = filter === f.id;
          return (
            <button key={f.id} type="button" onClick={() => setFilter(f.id)}
              className="alt-tap"
              style={{
                appearance: 'none', height: 30, padding: '0 12px', borderRadius: 999,
                background: on ? 'var(--ink)' : 'var(--paper)',
                color: on ? 'var(--paper)' : 'var(--ink-2)',
                border: `1px solid ${on ? 'var(--ink)' : 'var(--line)'}`,
                fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
                display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
              }}>
              {f.l}
              <span className="alt-mono" style={{ fontSize: 10, color: on ? 'rgba(244,239,227,.6)' : 'var(--ink-3)' }}>
                {f.n}
              </span>
            </button>
          );
        })}
      </div>

      <div className="alt-screen-body alt-scroll" style={{ padding: '0 20px 120px' }}>
        {groups.map((g, gi) => {
          const items = g.items.filter(it => visible(it.state));
          if (items.length === 0 && filter !== 'all') return null;
          return (
            <div key={gi} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '14px 4px 8px' }}>
                <div className="alt-eyebrow">{g.group}</div>
                <div className="alt-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
                  {g.items.filter(x => x.state === 'done').length}/{g.items.filter(x => x.state !== 'na').length}
                </div>
              </div>
              <div className="alt-card" style={{ padding: 0, overflow: 'hidden' }}>
                {g.items.map((it, ii) => {
                  if (!visible(it.state)) return null;
                  const isOpen = openItem === it.id;
                  const isNA = it.state === 'na';
                  return (
                    <div key={it.id} style={{
                      borderBottom: ii < g.items.length - 1 ? '0.5px solid var(--line)' : 'none',
                      background: isOpen ? 'var(--paper-2)' : 'transparent',
                      opacity: isNA ? 0.55 : 1,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px' }}>
                        <div style={{ paddingTop: 1 }}>
                          <StateCell state={it.state} onClick={() => cycle(gi, ii)}/>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOpenItem(isOpen ? null : it.id)}
                          className="alt-tap"
                          style={{ flex: 1, background: 'transparent', border: 0, padding: 0, textAlign: 'left' }}>
                          <div style={{
                            fontSize: 13.5, fontWeight: 500, color: 'var(--ink)',
                            textDecoration: it.state === 'done' || isNA ? 'line-through' : 'none',
                            textDecorationColor: 'rgba(0,0,0,.25)',
                            display: 'flex', alignItems: 'center', gap: 6,
                          }}>
                            {it.title}
                            {it.ai && <AIBadge/>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: 11, color: 'var(--ink-3)' }}>
                            <span className="alt-mono">{it.due}</span>
                            {it.detail && <span>· {it.detail}</span>}
                          </div>
                        </button>
                      </div>
                      {isOpen && (
                        <div style={{ padding: '4px 14px 14px', fontSize: 12, color: 'var(--ink-2)' }}>
                          {it.ai && (
                            <div style={{
                              padding: 10, background: 'var(--sage-tint)', borderRadius: 8, marginBottom: 10,
                              fontSize: 12, color: 'var(--ink-2)',
                              display: 'flex', alignItems: 'flex-start', gap: 8,
                              border: '0.5px solid rgba(30,58,102,.18)',
                            }}>
                              <AIBadge/>
                              <div>{it.ai}</div>
                            </div>
                          )}
                          <div className="alt-eyebrow" style={{ marginBottom: 6 }}>Set state</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
                            {(['todo','doing','done','na'] as ChecklistState[]).map(s => (
                              <button key={s} type="button"
                                onClick={() => {
                                  setGroups(prev => prev.map((grp, gi2) => gi2 !== gi ? grp : {
                                    ...grp, items: grp.items.map((x, xi) => xi !== ii ? x : { ...x, state: s })
                                  }));
                                }}
                                className="alt-tap"
                                style={{
                                  appearance: 'none', padding: '8px 6px', borderRadius: 8,
                                  border: `1px solid ${it.state === s ? STATE_CFG[s].dot : 'var(--line)'}`,
                                  background: it.state === s ? STATE_CFG[s].bg : 'var(--paper)',
                                  color: it.state === s ? STATE_CFG[s].fg : 'var(--ink-2)',
                                  fontSize: 10.5, fontWeight: 500,
                                }}>
                                {STATE_CFG[s].label}
                              </button>
                            ))}
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            <Button size="sm" variant="secondary">Add note</Button>
                            <Button size="sm" variant="ghost">View in contract</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI hint banner */}
      <div style={{
        position: 'absolute', left: 12, right: 12, bottom: 24, zIndex: 30,
        padding: '10px 14px', borderRadius: 22,
        background: 'rgba(20,34,63,0.92)', color: '#F4EFE3',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        display: 'flex', gap: 10, alignItems: 'center', boxShadow: 'var(--sh-2)',
      }}>
        <AIBadge label="Tip"/>
        <div style={{ flex: 1, fontSize: 12 }}>
          Mark anything not applicable. N/A items skip your weekly summaries.
        </div>
        <Button size="sm" variant="sage" onClick={() => go('deadlines')}>Deadlines</Button>
      </div>
    </>
  );
}
