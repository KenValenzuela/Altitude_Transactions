// screens-b.jsx — Transaction Overview, Checklist, Deadlines, Parties, Documents, Summary, Post-Close.

// ── 6. Transaction Overview ────────────────────────────────────────────────
function ScreenOverview({ go }) {
  const d = window.ALT_DATA;
  const p = d.property;
  const stats = (() => {
    const all = d.checklist.flatMap(g => g.items);
    const done = all.filter(x => x.state === 'done').length;
    const na   = all.filter(x => x.state === 'na').length;
    const doing= all.filter(x => x.state === 'doing').length;
    const todo = all.filter(x => x.state === 'todo').length;
    const active = all.length - na;
    return { done, na, doing, todo, active, total: all.length, pct: Math.round((done / active) * 100) };
  })();
  return (
    <PhoneShell label="06 Overview">
      <div className="alt-screen-body alt-scroll" style={{ paddingBottom: 120 }}>
        {/* Hero header with property */}
        <div style={{ position: 'relative', padding: '50px 12px 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 8px 12px',
          }}>
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
            { l: 'Price',   v: '$962,500',  m: 'Contract' },
            { l: 'Earnest', v: '$28,000',   m: 'Held · Heritage' },
            { l: 'Close',   v: 'May 01',    m: '15 days' },
          ].map((s, i) => (
            <div key={i} className="alt-card" style={{ flex: 1, padding: '10px 12px' }}>
              <div className="alt-eyebrow" style={{ fontSize: 9 }}>{s.l}</div>
              <div className="alt-display" style={{ fontSize: 18, marginTop: 4, fontStyle: 'italic' }}>{s.v}</div>
              <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{s.m}</div>
            </div>
          ))}
        </div>

        {/* Stage rail */}
        <SectionLabel>Stage</SectionLabel>
        <div className="alt-card" style={{ margin: '0 20px', padding: '12px 0' }}>
          <StageRail stages={d.stages}/>
          <div style={{
            padding: '6px 18px 0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: 12, color: 'var(--ink-3)',
          }}>
            <span>Currently <span style={{ color: 'var(--gold)', fontWeight: 600 }}>Appraisal</span></span>
            <span>Day 18 of 30</span>
          </div>
        </div>

        {/* Today's focus */}
        <SectionLabel action="See all">Today</SectionLabel>
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { t: 'Septic inspection — confirm 9am arrival',  s: 'Friday · High Country', state: 'doing' },
            { t: 'Send appraisal nudge to First Western',    s: 'Drafted by AI · review & send', state: 'todo', ai: true },
            { t: 'Title commitment review w/ buyer',         s: 'Schedule 15-min call', state: 'doing' },
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

        {/* Progress */}
        <SectionLabel>Progress</SectionLabel>
        <div className="alt-card" style={{ margin: '0 20px', padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div className="alt-display" style={{ fontSize: 36, fontStyle: 'italic' }}>
              {stats.pct}<span style={{ fontSize: 20, color: 'var(--ink-3)' }}>%</span>
            </div>
            <div className="alt-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
              {stats.done}/{stats.active} active items
            </div>
          </div>
          <div style={{
            marginTop: 12, height: 8, borderRadius: 999, background: 'var(--paper-2)',
            overflow: 'hidden', display: 'flex',
          }}>
            <div style={{ width: `${(stats.done / stats.active) * 100}%`, background: 'var(--sage)' }}/>
            <div style={{ width: `${(stats.doing / stats.active) * 100}%`, background: 'var(--gold)' }}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 11, color: 'var(--ink-3)' }}>
            <span><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 999, background: 'var(--sage)', marginRight: 4 }}/>{stats.done} done</span>
            <span><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 999, background: 'var(--gold)', marginRight: 4 }}/>{stats.doing} in progress</span>
            <span><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 999, background: 'var(--slate)', marginRight: 4 }}/>{stats.todo} to do</span>
            <span><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 999, background: 'var(--na)', marginRight: 4 }}/>{stats.na} N/A</span>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{
          padding: '18px 20px 0',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
        }}>
          {[
            { t: 'Checklist', s: `${stats.active} active`, to: 'checklist', accent: 'var(--ink)' },
            { t: 'Deadlines', s: 'Next: Apr 22',           to: 'deadlines', accent: 'var(--gold)' },
            { t: 'Parties',   s: '6 contacts',             to: 'parties',   accent: 'var(--sage)' },
            { t: 'Documents', s: '7 received · 3 pending', to: 'documents', accent: 'var(--clay)' },
          ].map((a) => (
            <button key={a.t} type="button" onClick={() => go(a.to)}
              className="alt-card alt-tap"
              style={{
                appearance: 'none', border: '1px solid var(--line)',
                background: 'var(--paper)',
                padding: 14, textAlign: 'left',
              }}>
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
          <Button full variant="sage" onClick={() => go('summary')}>
            View this week's summary
          </Button>
        </div>
      </div>
    </PhoneShell>
  );
}

// ── 7. Checklist ───────────────────────────────────────────────────────────
function ScreenChecklist({ go }) {
  const d = window.ALT_DATA;
  const [groups, setGroups] = React.useState(d.checklist);
  const [filter, setFilter] = React.useState('all'); // all | active | done | na
  const [openItem, setOpenItem] = React.useState(null);

  const cycle = (gIdx, iIdx) => {
    setGroups(prev => prev.map((g, gi) => gi !== gIdx ? g : {
      ...g,
      items: g.items.map((it, ii) => ii !== iIdx ? it : { ...it, state: nextState(it.state) })
    }));
  };

  const visible = (state) => {
    if (filter === 'all') return state !== 'na';
    if (filter === 'active') return state === 'todo' || state === 'doing';
    if (filter === 'done') return state === 'done';
    if (filter === 'na') return state === 'na';
    return true;
  };

  const counts = (() => {
    const all = groups.flatMap(g => g.items);
    return {
      all: all.filter(x => x.state !== 'na').length,
      active: all.filter(x => x.state === 'todo' || x.state === 'doing').length,
      done: all.filter(x => x.state === 'done').length,
      na: all.filter(x => x.state === 'na').length,
    };
  })();

  return (
    <PhoneShell label="07 Checklist">
      <TopBar
        eyebrow="Pine Ridge Trail · Contract to close"
        title="Checklist"
        leading={<IconButton icon={Icon.back()} onClick={() => go('overview')} label="Back"/>}
        trailing={<IconButton icon={Icon.plus()} label="Add task"/>}
      />
      {/* filter chips */}
      <div style={{
        padding: '0 20px 12px',
        display: 'flex', gap: 8, overflowX: 'auto',
      }} className="alt-scroll">
        {[
          { id: 'all',    l: 'All',         n: counts.all },
          { id: 'active', l: 'Active',      n: counts.active },
          { id: 'done',   l: 'Done',        n: counts.done },
          { id: 'na',     l: 'N/A hidden',  n: counts.na },
        ].map(f => {
          const on = filter === f.id;
          return (
            <button key={f.id} type="button" onClick={() => setFilter(f.id)}
              className="alt-tap"
              style={{
                appearance: 'none', height: 30, padding: '0 12px',
                borderRadius: 999,
                background: on ? 'var(--ink)' : 'var(--paper)',
                color: on ? 'var(--paper)' : 'var(--ink-2)',
                border: `1px solid ${on ? 'var(--ink)' : 'var(--line)'}`,
                fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                flexShrink: 0,
              }}>
              {f.l}
              <span className="alt-mono" style={{
                fontSize: 10,
                color: on ? 'rgba(244,239,227,.6)' : 'var(--ink-3)',
              }}>{f.n}</span>
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
              <div style={{
                display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                padding: '14px 4px 8px',
              }}>
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
                      <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: 12,
                        padding: '12px 14px',
                      }}>
                        <div style={{ paddingTop: 1 }}>
                          <StateCell state={it.state} onClick={() => cycle(gi, ii)}/>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOpenItem(isOpen ? null : it.id)}
                          className="alt-tap"
                          style={{
                            flex: 1, background: 'transparent', border: 0, padding: 0,
                            textAlign: 'left',
                          }}>
                          <div style={{
                            fontSize: 13.5, fontWeight: 500,
                            color: 'var(--ink)',
                            textDecoration: it.state === 'done' || isNA ? 'line-through' : 'none',
                            textDecorationColor: 'rgba(0,0,0,.25)',
                            display: 'flex', alignItems: 'center', gap: 6,
                          }}>
                            {it.title}
                            {it.ai && <AIBadge/>}
                          </div>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            marginTop: 4, fontSize: 11, color: 'var(--ink-3)',
                          }}>
                            <span className="alt-mono">{it.due}</span>
                            {it.detail && <span>· {it.detail}</span>}
                          </div>
                        </button>
                      </div>
                      {isOpen && (
                        <div style={{
                          padding: '4px 14px 14px',
                          fontSize: 12, color: 'var(--ink-2)',
                        }}>
                          {it.ai && (
                            <div style={{
                              padding: 10, background: 'var(--sage-tint)',
                              borderRadius: 8, marginBottom: 10,
                              fontSize: 12, color: 'var(--ink-2)',
                              display: 'flex', alignItems: 'flex-start', gap: 8,
                              border: '0.5px solid rgba(30,58,102,.18)',
                            }}>
                              <AIBadge/>
                              <div>{it.ai}</div>
                            </div>
                          )}
                          <div className="alt-eyebrow" style={{ marginBottom: 6 }}>Set state</div>
                          <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6,
                          }}>
                            {['todo','doing','done','na'].map(s => (
                              <button key={s} type="button"
                                onClick={() => {
                                  setGroups(prev => prev.map((g, gi2) => gi2 !== gi ? g : {
                                    ...g, items: g.items.map((x, xi) => xi !== ii ? x : { ...x, state: s })
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

      {/* AI hint banner at bottom */}
      <div style={{
        position: 'absolute', left: 12, right: 12, bottom: 24, zIndex: 30,
        padding: '10px 14px', borderRadius: 22,
        background: 'rgba(20,34,63,0.92)', color: '#F4EFE3',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex', gap: 10, alignItems: 'center',
        boxShadow: 'var(--sh-2)',
      }}>
        <AIBadge label="Tip"/>
        <div style={{ flex: 1, fontSize: 12 }}>
          Mark anything not applicable. N/A items skip your weekly summaries.
        </div>
        <Button size="sm" variant="sage" onClick={() => go('deadlines')}>Deadlines</Button>
      </div>
    </PhoneShell>
  );
}

// ── 8. Deadlines / Calendar ───────────────────────────────────────────────
function ScreenDeadlines({ go }) {
  const d = window.ALT_DATA;
  const [view, setView] = React.useState('timeline'); // timeline | month

  // simple month grid for April
  const month = (() => {
    const days = [];
    // Apr 2024 starts on a Monday (day 1), pad weekdays Sun-Sat
    const firstDow = 1; // Mon
    for (let i = 0; i < firstDow; i++) days.push(null);
    for (let dt = 1; dt <= 30; dt++) days.push(dt);
    return days;
  })();
  const eventByDay = (() => {
    const map = {};
    d.deadlines.forEach(e => {
      const day = parseInt(e.date.split(' ')[1], 10);
      if (e.date.startsWith('Apr')) map[day] = e;
    });
    return map;
  })();

  return (
    <PhoneShell label="08 Deadlines">
      <TopBar
        eyebrow="Pine Ridge Trail"
        title="Deadlines"
        leading={<IconButton icon={Icon.back()} onClick={() => go('overview')} label="Back"/>}
      />
      {/* view switcher */}
      <div style={{ padding: '0 20px 12px' }}>
        <div style={{
          display: 'inline-flex', padding: 3, borderRadius: 999,
          background: 'var(--paper-2)', border: '1px solid var(--line)',
        }}>
          {[
            { id: 'timeline', l: 'Timeline' },
            { id: 'month',    l: 'Month' },
          ].map(v => (
            <button key={v.id} type="button" onClick={() => setView(v.id)}
              className="alt-tap"
              style={{
                appearance: 'none', height: 28, padding: '0 14px',
                borderRadius: 999,
                background: view === v.id ? 'var(--paper)' : 'transparent',
                color: view === v.id ? 'var(--ink)' : 'var(--ink-3)',
                border: 0,
                fontSize: 12, fontWeight: 500,
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
            {/* Countdown card */}
            <div className="alt-card" style={{
              padding: 18, background: 'var(--ink)', color: 'var(--paper)',
              border: 0, position: 'relative', overflow: 'hidden', marginBottom: 14,
            }}>
              <svg style={{ position: 'absolute', right: -20, top: -20, opacity: 0.12 }}
                width="160" height="160" viewBox="0 0 160 160">
                <path d="M0 130 L40 80 L70 100 L120 50 L160 90 L160 160 L0 160 Z" fill="#F4EFE3"/>
              </svg>
              <div className="alt-eyebrow" style={{ color: 'rgba(244,239,227,.55)' }}>Closing in</div>
              <div className="alt-display" style={{
                fontSize: 64, fontStyle: 'italic', lineHeight: 1, marginTop: 6, color: '#F4EFE3',
              }}>
                15<span style={{ fontSize: 22, fontStyle: 'normal' }}>d</span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(244,239,227,.7)', marginTop: 6 }}>
                May 01 · 10:00 AM · Heritage Title Co.
              </div>
            </div>

            {/* Timeline */}
            <div style={{ position: 'relative', paddingLeft: 22 }}>
              <div style={{
                position: 'absolute', left: 7, top: 8, bottom: 8, width: 1.5,
                background: 'var(--line)',
              }}/>
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
                      <div className="alt-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                        {e.day} · {e.date}
                      </div>
                      <div style={{
                        fontSize: 10, color: e.urgent ? 'var(--clay)' : 'var(--ink-3)',
                        fontFamily: 'var(--f-mono)', fontWeight: 500,
                      }}>
                        in {e.days}d
                      </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>{e.label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <span className="alt-pill" style={{
                        background: 'var(--paper-2)', color: 'var(--ink-3)',
                        fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}>{e.tag}</span>
                      {e.urgent && (
                        <span className="alt-pill" style={{
                          background: 'var(--clay-soft)', color: 'var(--clay)',
                        }}>
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
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '0 4px 10px',
            }}>
              <div className="alt-display" style={{ fontSize: 22, fontStyle: 'italic' }}>April</div>
              <div className="alt-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>2024</div>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4,
              marginBottom: 6,
            }}>
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} style={{
                  textAlign: 'center', fontSize: 10, color: 'var(--ink-3)',
                  fontFamily: 'var(--f-mono)', letterSpacing: '0.1em',
                }}>{d}</div>
              ))}
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4,
            }}>
              {month.map((dt, i) => {
                const ev = dt && eventByDay[dt];
                const isToday = dt === 16;
                return (
                  <div key={i} className={dt ? 'alt-tap' : ''} style={{
                    aspectRatio: '1 / 1', borderRadius: 8,
                    background: !dt ? 'transparent' :
                                ev?.urgent ? 'var(--clay-soft)' :
                                ev ? 'var(--paper)' :
                                isToday ? 'var(--ink)' : 'var(--paper-2)',
                    color: !dt ? 'transparent' :
                           ev?.urgent ? 'var(--clay)' :
                           isToday ? 'var(--paper)' : 'var(--ink-2)',
                    border: ev ? `1px solid ${ev.urgent ? 'var(--clay)' : 'var(--line)'}` : '1px solid transparent',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'flex-start', justifyContent: 'space-between',
                    padding: '4px 5px',
                    position: 'relative',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: isToday || ev ? 600 : 400 }}>
                      {dt || ''}
                    </div>
                    {ev && (
                      <div style={{
                        width: '100%',
                        fontSize: 8, lineHeight: 1.1, letterSpacing: '0.02em',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontWeight: 500,
                      }}>{ev.label.split(' ')[0]}</div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 16 }}>
              <div className="alt-eyebrow" style={{ padding: '0 4px 8px' }}>Upcoming</div>
              <div className="alt-card" style={{ padding: 0 }}>
                {d.deadlines.slice(0, 4).map((e, i, a) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px',
                    borderBottom: i < a.length - 1 ? '0.5px solid var(--line)' : 'none',
                  }}>
                    <div className="alt-mono" style={{ fontSize: 11, color: 'var(--ink-3)', minWidth: 48 }}>
                      {e.date}
                    </div>
                    <div style={{ flex: 1, fontSize: 13 }}>{e.label}</div>
                    {e.urgent && (
                      <span style={{
                        width: 6, height: 6, borderRadius: 999, background: 'var(--clay)',
                      }}/>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </PhoneShell>
  );
}

// ── 9. Parties ────────────────────────────────────────────────────────────
function ScreenParties({ go }) {
  const d = window.ALT_DATA;
  return (
    <PhoneShell label="09 Parties">
      <TopBar
        eyebrow="Pine Ridge Trail"
        title="Parties"
        leading={<IconButton icon={Icon.back()} onClick={() => go('overview')} label="Back"/>}
        trailing={<IconButton icon={Icon.plus()} label="Add"/>}
      />
      <div className="alt-screen-body alt-scroll" style={{ padding: '0 20px 40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {d.parties.map((p, i) => (
            <div key={i} className="alt-card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar initials={p.initials} color={p.color} size={42}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="alt-eyebrow">{p.role}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 500, marginTop: 2 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 1 }}>{p.sub}</div>
                </div>
              </div>
              <div style={{
                display: 'flex', gap: 8, marginTop: 12,
              }}>
                <button type="button" className="alt-tap" style={{
                  flex: 1, appearance: 'none',
                  padding: '8px 0', borderRadius: 10,
                  border: '1px solid var(--line)',
                  background: 'var(--paper)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  color: 'var(--ink-2)',
                }}>
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path d="M2 4 Q2 2 4 2 L5 2 Q6 2 6 3 L6.5 5 Q6.5 6 5.5 6 L5 6.5 Q6 9 8 10 L8.5 9.5 Q9 8.5 10 9 L12 9.5 Q13 9.5 13 10.5 L13 11.5 Q13 13 11 13 Q5 13 2 4 Z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 500 }}>Call</span>
                </button>
                <button type="button" className="alt-tap" style={{
                  flex: 1, appearance: 'none',
                  padding: '8px 0', borderRadius: 10,
                  border: '1px solid var(--line)',
                  background: 'var(--paper)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  color: 'var(--ink-2)',
                }}>
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <rect x="1.5" y="3" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                    <path d="M1.5 4 L7 8 L12.5 4" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 500 }}>Email</span>
                </button>
                <button type="button" className="alt-tap" style={{
                  flex: 1, appearance: 'none',
                  padding: '8px 0', borderRadius: 10,
                  border: '1px solid var(--line)',
                  background: 'var(--paper)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  color: 'var(--ink-2)',
                }}>
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path d="M2 3 H12 V10 L9 10 L7 12 L7 10 H2 Z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 500 }}>Text</span>
                </button>
              </div>
              <div style={{
                marginTop: 10, paddingTop: 10, borderTop: '0.5px solid var(--line)',
                display: 'flex', justifyContent: 'space-between',
                fontSize: 11, color: 'var(--ink-3)',
                fontFamily: 'var(--f-mono)',
              }}>
                <span>{p.phone}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginLeft: 12 }}>
                  {p.email}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Comm log preview */}
        <SectionLabel action="Open">Notes & comms</SectionLabel>
        <div className="alt-card" style={{ padding: 0 }}>
          {d.notes.slice(0, 3).map((n, i, a) => (
            <div key={i} style={{
              padding: '12px 14px',
              borderBottom: i < a.length - 1 ? '0.5px solid var(--line)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{n.author}</div>
                <div className="alt-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{n.when}</div>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.45 }}>{n.text}</div>
            </div>
          ))}
        </div>
      </div>
    </PhoneShell>
  );
}

// ── 10. Documents ─────────────────────────────────────────────────────────
function ScreenDocuments({ go }) {
  const d = window.ALT_DATA;
  const [filter, setFilter] = React.useState('all');
  const docs = d.documents;

  const groups = {
    received: docs.filter(x => x.state === 'received'),
    pending:  docs.filter(x => x.state === 'pending'),
    upcoming: docs.filter(x => x.state === 'upcoming'),
    na:       docs.filter(x => x.state === 'na'),
  };

  const renderDoc = (doc) => (
    <div key={doc.id} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      borderBottom: '0.5px solid var(--line)',
      opacity: doc.state === 'na' ? 0.55 : 1,
    }}>
      <div style={{
        width: 32, height: 38, borderRadius: 4,
        background: doc.state === 'received' ? 'var(--sage-tint)' :
                    doc.state === 'pending'  ? 'var(--gold-soft)'  :
                    doc.state === 'na'       ? 'var(--na-soft)'    :
                                               'var(--paper-2)',
        border: '1px solid var(--line)',
        flexShrink: 0, position: 'relative',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: 4,
      }}>
        <svg width="18" height="18" viewBox="0 0 18 18" style={{
          position: 'absolute', top: 4, left: 7,
        }}>
          <path d="M3 1 H10 L14 5 V16 H3 Z"
            stroke={doc.state === 'received' ? 'var(--sage-deep)' :
                    doc.state === 'pending' ? 'var(--gold)' :
                    'var(--ink-3)'}
            strokeWidth="1" fill="none"/>
          <path d="M10 1 V5 H14" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.4"/>
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 500,
          textDecoration: doc.state === 'na' ? 'line-through' : 'none',
          textDecorationColor: 'rgba(0,0,0,.25)',
        }}>{doc.name}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
          {doc.detail || (doc.received ? `${doc.src} · ${doc.received}` : `${doc.src} · awaiting`)}
        </div>
      </div>
      {doc.state === 'received' && (
        <span style={{ color: 'var(--sage)' }}>{Icon.check()}</span>
      )}
      {doc.state === 'pending' && (
        <span className="alt-pill" style={{ background: 'var(--gold-soft)', color: 'var(--gold)' }}>
          <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--gold)' }}/>
          {doc.urgent ? 'Urgent' : 'Pending'}
        </span>
      )}
      {doc.state === 'upcoming' && (
        <span className="alt-pill" style={{ background: 'var(--slate-soft)', color: 'var(--slate)' }}>Upcoming</span>
      )}
      {doc.state === 'na' && (
        <span className="alt-pill" style={{ background: 'var(--na-soft)', color: 'var(--na)' }}>N/A</span>
      )}
    </div>
  );

  return (
    <PhoneShell label="10 Documents">
      <TopBar
        eyebrow="Pine Ridge Trail"
        title="Documents"
        leading={<IconButton icon={Icon.back()} onClick={() => go('overview')} label="Back"/>}
        trailing={<IconButton icon={Icon.upload()} label="Upload"/>}
      />
      <div style={{ padding: '0 20px 12px', display: 'flex', gap: 8 }}>
        {[
          { id: 'all',      l: 'All',       n: docs.filter(x => x.state !== 'na').length },
          { id: 'received', l: 'Received',  n: groups.received.length },
          { id: 'pending',  l: 'Pending',   n: groups.pending.length },
          { id: 'na',       l: 'N/A',       n: groups.na.length },
        ].map(f => {
          const on = filter === f.id;
          return (
            <button key={f.id} type="button" onClick={() => setFilter(f.id)}
              className="alt-tap"
              style={{
                appearance: 'none', height: 30, padding: '0 12px',
                borderRadius: 999,
                background: on ? 'var(--ink)' : 'var(--paper)',
                color: on ? 'var(--paper)' : 'var(--ink-2)',
                border: `1px solid ${on ? 'var(--ink)' : 'var(--line)'}`,
                fontSize: 12, fontWeight: 500,
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
              {f.l}
              <span className="alt-mono" style={{ fontSize: 10, opacity: 0.65 }}>{f.n}</span>
            </button>
          );
        })}
      </div>

      <div className="alt-screen-body alt-scroll" style={{ padding: '0 20px 40px' }}>
        {/* CTME callout */}
        <div className="alt-card" style={{
          padding: 12, display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--paper-2)', marginBottom: 14,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--ink)', color: 'var(--paper)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--f-mono)', fontWeight: 600, fontSize: 11,
            letterSpacing: '0.02em',
          }}>CTME</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 500 }}>Contracts live in CTME</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1 }}>
              Altitude mirrors what's signed. Final forms stay there.
            </div>
          </div>
          <div style={{ color: 'var(--ink-3)' }}>{Icon.chevR()}</div>
        </div>

        {filter === 'all' && (
          <>
            <div className="alt-eyebrow" style={{ padding: '0 4px 8px' }}>Received · {groups.received.length}</div>
            <div className="alt-card" style={{ padding: 0, marginBottom: 14, overflow: 'hidden' }}>
              {groups.received.map(renderDoc)}
            </div>
            <div className="alt-eyebrow" style={{ padding: '0 4px 8px' }}>Pending · {groups.pending.length}</div>
            <div className="alt-card" style={{ padding: 0, marginBottom: 14, overflow: 'hidden' }}>
              {groups.pending.map(renderDoc)}
            </div>
            <div className="alt-eyebrow" style={{ padding: '0 4px 8px' }}>Upcoming · {groups.upcoming.length}</div>
            <div className="alt-card" style={{ padding: 0, marginBottom: 14, overflow: 'hidden' }}>
              {groups.upcoming.map(renderDoc)}
            </div>
            <div className="alt-eyebrow" style={{ padding: '0 4px 8px' }}>Marked N/A · {groups.na.length} (hidden from summaries)</div>
            <div className="alt-card" style={{ padding: 0, overflow: 'hidden' }}>
              {groups.na.map(renderDoc)}
            </div>
          </>
        )}
        {filter !== 'all' && (
          <div className="alt-card" style={{ padding: 0, overflow: 'hidden' }}>
            {(filter === 'received' ? groups.received :
              filter === 'pending'  ? [...groups.pending, ...groups.upcoming] :
              groups.na).map(renderDoc)}
          </div>
        )}
      </div>
    </PhoneShell>
  );
}

// ── 11. Weekly Summary ─────────────────────────────────────────────────────
function ScreenSummary({ go }) {
  const d = window.ALT_DATA;
  return (
    <PhoneShell label="11 Weekly Summary">
      <TopBar
        eyebrow="Pine Ridge Trail · Weekly"
        title="Summary"
        leading={<IconButton icon={Icon.back()} onClick={() => go('overview')} label="Back"/>}
        trailing={<AIBadge size="lg" label="AI · Draft"/>}
      />
      <div className="alt-screen-body alt-scroll" style={{ padding: '0 20px 110px' }}>
        {/* Top date strip */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '4px 4px 14px',
        }}>
          <div>
            <div className="alt-eyebrow">Week of</div>
            <div className="alt-display" style={{ fontSize: 22, fontStyle: 'italic', marginTop: 2 }}>
              {d.summary.week}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" className="alt-tap" style={{
              appearance: 'none', width: 30, height: 30, borderRadius: 999,
              border: '1px solid var(--line)', background: 'var(--paper)',
              color: 'var(--ink-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>‹</button>
            <button type="button" className="alt-tap" style={{
              appearance: 'none', width: 30, height: 30, borderRadius: 999,
              border: '1px solid var(--line)', background: 'var(--paper)',
              color: 'var(--ink-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>›</button>
          </div>
        </div>

        {/* Glance card */}
        <div className="alt-card" style={{
          padding: 16, background: 'var(--paper)',
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10,
        }}>
          {[
            { l: 'Completed', v: d.summary.completed.length, c: 'var(--sage-deep)' },
            { l: 'Upcoming',  v: d.summary.upcoming.length,  c: 'var(--gold)' },
            { l: 'Risks',     v: d.summary.risks.length,     c: 'var(--clay)' },
          ].map((s, i) => (
            <div key={i} style={{
              textAlign: 'left',
              borderRight: i < 2 ? '0.5px solid var(--line)' : 'none',
              paddingRight: i < 2 ? 10 : 0,
            }}>
              <div className="alt-eyebrow" style={{ fontSize: 9 }}>{s.l}</div>
              <div className="alt-display" style={{ fontSize: 32, fontStyle: 'italic', color: s.c, marginTop: 4 }}>
                {s.v}
              </div>
            </div>
          ))}
        </div>

        {/* Letterhead-style sections */}
        <div style={{ marginTop: 22 }}>
          <div className="alt-eyebrow" style={{ marginBottom: 8 }}>
            <span style={{ color: 'var(--sage-deep)' }}>● </span>Completed this week
          </div>
          <div className="alt-card" style={{ padding: 0 }}>
            {d.summary.completed.map((c, i, a) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '12px 14px',
                borderBottom: i < a.length - 1 ? '0.5px solid var(--line)' : 'none',
              }}>
                <span style={{
                  color: 'var(--sage)', flexShrink: 0, marginTop: 1,
                }}>{Icon.check()}</span>
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
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px',
                borderBottom: i < a.length - 1 ? '0.5px solid var(--line)' : 'none',
              }}>
                <div className="alt-mono" style={{ fontSize: 11, color: 'var(--ink-3)', minWidth: 76 }}>
                  {c.d}
                </div>
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
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '12px 14px',
                borderBottom: i < a.length - 1 ? '0.5px solid var(--line)' : 'none',
              }}>
                <span style={{ color: 'var(--clay)', flexShrink: 0, marginTop: 2 }}>
                  {Icon.alert()}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.45 }}>{r.t}</div>
                  <div className="alt-mono" style={{
                    fontSize: 10, color: 'var(--ink-3)', marginTop: 4,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>{r.sev === 'med' ? 'Medium' : 'Low'} priority</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: 22, padding: 14, borderRadius: 'var(--r-md)',
          background: 'var(--sage-tint)',
          border: '0.5px solid rgba(30,58,102,.22)',
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <AIBadge size="lg"/>
          <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5 }}>
            <span style={{ fontWeight: 500, color: 'var(--ink)' }}>What I'd watch this week.</span>{' '}
            Appraisal arrival on Tuesday is the lynchpin — every closing date after it depends on a clean number. I'd lean on First Western Monday morning rather than wait.
          </div>
        </div>

        <div style={{
          marginTop: 22, fontFamily: 'var(--f-mono)', fontSize: 10,
          color: 'var(--ink-3)', textAlign: 'center', letterSpacing: '0.06em',
        }}>
          drafted by altitude · reviewed by brett morales · {d.summary.week}
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
        display: 'flex', gap: 8,
      }}>
        <Button variant="secondary" full>Edit draft</Button>
        <Button variant="sage" full onClick={() => go('postclose')}>
          Send to buyer & seller
        </Button>
      </div>
    </PhoneShell>
  );
}

// ── 12. Post-close ─────────────────────────────────────────────────────────
function ScreenPostClose({ go }) {
  const d = window.ALT_DATA;
  const [tasks, setTasks] = React.useState(d.postClose);

  const cycle = (i) => {
    setTasks(prev => prev.map((t, j) => j !== i ? t : { ...t, state: nextState(t.state) }));
  };

  return (
    <PhoneShell label="12 Post-Close">
      <div className="alt-screen-body alt-scroll" style={{ paddingBottom: 60 }}>
        {/* Celebration hero */}
        <div style={{ position: 'relative', padding: '50px 12px 0' }}>
          <div style={{ padding: '8px 8px 12px', display: 'flex', justifyContent: 'space-between' }}>
            <IconButton icon={Icon.back()} onClick={() => go('summary')} label="Back"/>
            <div className="alt-eyebrow">Transaction · #2403 · Closed</div>
            <div style={{ width: 36 }}/>
          </div>
          <div style={{
            position: 'relative', height: 200,
            borderRadius: 'var(--r-md)', overflow: 'hidden',
            background: 'linear-gradient(165deg, #0E1A30 0%, #1E3A66 60%, #B8862F 130%)',
          }}>
            <svg viewBox="0 0 320 200" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              <path d="M0 150 L40 116 L70 130 L110 92 L150 126 L190 108 L230 132 L270 114 L320 130 L320 200 L0 200 Z" fill="#1E3A66" opacity="0.55"/>
              <path d="M0 170 L30 158 L60 168 L100 148 L140 164 L180 150 L220 170 L260 156 L320 168 L320 200 L0 200 Z" fill="#0E1A30"/>
              <circle cx="245" cy="52" r="18" fill="#F1ECDF" opacity="0.9"/>
              {/* confetti dots */}
              {[...Array(14)].map((_, i) => (
                <circle key={i} cx={20 + (i*22)} cy={30 + ((i*7) % 35)}
                  r={2 + ((i*3) % 3)}
                  fill={['#F1ECDF','#B8862F','#F4EFE3'][i%3]}
                  opacity={0.65}/>
              ))}
            </svg>
            <div style={{
              position: 'absolute', left: 16, bottom: 16, right: 16,
              color: '#F4EFE3', textShadow: '0 1px 12px rgba(0,0,0,.3)',
            }}>
              <div className="alt-eyebrow" style={{ color: 'rgba(244,239,227,.7)' }}>
                Closed · May 01 · 10:22 AM
              </div>
              <div className="alt-display" style={{ fontSize: 28, fontStyle: 'italic', marginTop: 6 }}>
                Keys to the Okafors.
              </div>
            </div>
          </div>
        </div>

        {/* Sentiment line */}
        <div style={{ padding: '14px 20px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
            30 days from offer to close. <span style={{ color: 'var(--sage-deep)', fontWeight: 500 }}>42 of 42</span> active items complete. <span style={{ color: 'var(--na)' }}>5</span> N/A.
          </div>
        </div>

        <SectionLabel>Follow-up</SectionLabel>
        <div style={{ padding: '0 20px' }}>
          <div className="alt-card" style={{ padding: 0 }}>
            {tasks.map((t, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px',
                borderBottom: i < tasks.length - 1 ? '0.5px solid var(--line)' : 'none',
                opacity: t.state === 'na' ? 0.55 : 1,
              }}>
                <StateCell state={t.state} onClick={() => cycle(i)}/>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 500,
                    textDecoration: t.state === 'done' ? 'line-through' : 'none',
                    textDecorationColor: 'rgba(0,0,0,.25)',
                  }}>{t.t}</div>
                  <div className="alt-mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>
                    {t.when}
                  </div>
                </div>
                <StatePill state={t.state}/>
              </div>
            ))}
          </div>
        </div>

        {/* AI suggestion */}
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{
            padding: 14, borderRadius: 'var(--r-md)',
            background: 'var(--sage-tint)',
            border: '0.5px solid rgba(30,58,102,.22)',
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <AIBadge size="lg"/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>
                Draft a thank-you to Sarah Chen?
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.45 }}>
                Smooth co-op on the listing side. A short note keeps the door open for the next deal.
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <Button size="sm" variant="sage">Draft</Button>
                <Button size="sm" variant="ghost">Maybe later</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Archive */}
        <div style={{ padding: '18px 20px 30px' }}>
          <Button full variant="secondary" onClick={() => go('dashboard')}>
            Archive transaction
          </Button>
        </div>
      </div>
    </PhoneShell>
  );
}

Object.assign(window, {
  ScreenOverview, ScreenChecklist, ScreenDeadlines,
  ScreenParties, ScreenDocuments, ScreenSummary, ScreenPostClose,
});
