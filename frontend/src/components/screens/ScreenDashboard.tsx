'use client';
import { useState } from 'react';
import type { GoFn } from '@/types';
import type { ApiUser, TransactionCard } from '@/types/api';
import { DEMO_TRANSACTIONS, DEMO_USER } from '@/lib/fixtures';
import { AIBadge } from '@/components/ui/AIBadge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/icons';
import { IconButton } from '@/components/ui/IconButton';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { TabBar } from '@/components/ui/TabBar';
import { TopBar } from '@/components/ui/TopBar';

interface ScreenDashboardProps {
  go: GoFn;
  user?: ApiUser;
  transactions?: TransactionCard[];
  /** Open a transaction workspace. Defaults to go('overview'). */
  onOpen?: (id: string) => void;
}

export function ScreenDashboard({
  go,
  user = DEMO_USER,
  transactions = DEMO_TRANSACTIONS,
  onOpen,
}: ScreenDashboardProps) {
  const [tab, setTab] = useState('home');
  const open = onOpen ?? (() => go('overview'));

  const urgent = transactions.find((t) => t.urgent) ?? transactions[0];
  const stats = {
    active: transactions.length,
    closingThisWeek: transactions.filter((t) => t.daysToClose <= 7).length,
    nextDeadline: urgent ? urgent.next : 'Nothing urgent',
    days: urgent ? urgent.daysToClose : 0,
  };
  const firstName = user.name.split(' ')[0];

  return (
    <>
      <TopBar
        eyebrow={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        title={`Good morning, ${firstName}`}
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
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 10, padding: '0 20px' }}>
          <div className="alt-card" style={{ padding: 16, background: 'var(--ink)', color: 'var(--paper)', border: 0 }}>
            <div className="alt-eyebrow" style={{ color: 'rgba(244,239,227,.55)' }}>Next up</div>
            <div className="alt-display" style={{ fontSize: 32, fontStyle: 'italic', marginTop: 6, color: '#F4EFE3' }}>
              {stats.days} <span style={{ fontSize: 16, fontStyle: 'normal' }}>days</span>
            </div>
            <div style={{ fontSize: 12, marginTop: 4, color: 'rgba(244,239,227,.7)' }}>{stats.nextDeadline}</div>
            <div style={{
              marginTop: 12, padding: '6px 10px', borderRadius: 8,
              background: 'rgba(244,239,227,0.08)', color: '#F4EFE3',
              fontSize: 11, display: 'inline-flex', gap: 6, alignItems: 'center',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--gold)', display: 'inline-block' }} className="alt-pulse"/>
              {urgent ? urgent.address : '—'}
            </div>
          </div>
          <div className="alt-card" style={{ padding: 16 }}>
            <div className="alt-eyebrow">Active</div>
            <div className="alt-display" style={{ fontSize: 32, marginTop: 6 }}>{stats.active}</div>
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
            display: 'flex', alignItems: 'flex-start', gap: 10, padding: 14,
            background: 'var(--sage-tint)', border: '0.5px solid rgba(30,58,102,.22)',
            borderRadius: 'var(--r-md)',
          }}>
            <AIBadge size="lg"/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>
                {urgent ? `${urgent.stage} at ${urgent.address} needs attention.` : 'No urgent items today.'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 2, lineHeight: 1.45 }}>
                {urgent ? `${urgent.next} — ${urgent.daysToClose} days to close. Suggest a check-in with the lender.` : 'Everything is on track across your active transactions.'}
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
          {transactions.map(tx => (
            <button
              key={tx.id}
              type="button"
              className="alt-card alt-tap"
              onClick={() => open(tx.id)}
              style={{
                appearance: 'none', width: '100%', textAlign: 'left',
                padding: 0, border: '1px solid var(--line)',
                background: 'var(--paper)', overflow: 'hidden',
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
                      <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--clay)', flexShrink: 0, display: 'inline-block' }} className="alt-pulse"/>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
                    {tx.city} · {tx.parties}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <div style={{ flex: 1, height: 4, borderRadius: 999, background: 'var(--paper-2)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${tx.progress * 100}%`, height: '100%',
                        background: tx.progress > 0.85 ? 'var(--sage)' : 'var(--ink)',
                        borderRadius: 999,
                      }}/>
                    </div>
                    <div className="alt-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{tx.daysToClose}d</div>
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
                <span style={{ color: tx.urgent ? 'var(--clay)' : 'var(--ink-3)', fontWeight: tx.urgent ? 500 : 400 }}>
                  {tx.next}
                </span>
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
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>Start a new transaction</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 1 }}>
                Drop a CTM contract PDF — AI extracts deadlines and tasks.
              </div>
            </div>
            <div style={{ color: 'var(--ink-3)' }}>{Icon.chevR()}</div>
          </button>
        </div>
      </div>

      <TabBar active={tab} onChange={setTab} items={[
        { id: 'home',  label: 'Home',     icon: Icon.home },
        { id: 'cal',   label: 'Calendar', icon: Icon.calendar },
        { id: 'tasks', label: 'Tasks',    icon: Icon.list },
        { id: 'docs',  label: 'Docs',     icon: Icon.doc },
      ]}/>
    </>
  );
}
