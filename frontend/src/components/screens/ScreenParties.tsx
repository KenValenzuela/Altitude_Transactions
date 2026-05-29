'use client';
import type { GoFn } from '@/types';
import type { ApiParty } from '@/types/api';
import { DEMO_DETAIL } from '@/lib/fixtures';
import { initialsFromName, partyColor, roleLabel } from '@/lib/format';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/icons';
import { IconButton } from '@/components/ui/IconButton';
import { TopBar } from '@/components/ui/TopBar';

interface ScreenPartiesProps {
  go: GoFn;
  parties?: ApiParty[];
  title?: string;
}

export function ScreenParties({ go, parties = DEMO_DETAIL.parties, title = 'Parties' }: ScreenPartiesProps) {
  return (
    <>
      <TopBar
        eyebrow={title}
        title="Parties"
        leading={<IconButton icon={Icon.back()} onClick={() => go('overview')} label="Back"/>}
        trailing={<IconButton icon={Icon.plus()} label="Add"/>}
      />
      <div className="alt-screen-body alt-scroll" style={{ padding: '0 20px 40px' }}>
        {parties.length === 0 && (
          <div className="alt-card" style={{ padding: 16, fontSize: 13, color: 'var(--ink-3)' }}>
            No parties on this transaction yet.
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {parties.map((p) => (
            <div key={p.id} className="alt-card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar initials={initialsFromName(p.name)} color={partyColor(p)} size={42}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="alt-eyebrow">{roleLabel(p.role)}</div>
                  <div style={{ fontSize: 15, fontWeight: 500, marginTop: 2 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 1 }}>{p.sub}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {[
                  { label: 'Call', icon: <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 4 Q2 2 4 2 L5 2 Q6 2 6 3 L6.5 5 Q6.5 6 5.5 6 L5 6.5 Q6 9 8 10 L8.5 9.5 Q9 8.5 10 9 L12 9.5 Q13 9.5 13 10.5 L13 11.5 Q13 13 11 13 Q5 13 2 4 Z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round"/></svg> },
                  { label: 'Email', icon: <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="3" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M1.5 4 L7 8 L12.5 4" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round"/></svg> },
                  { label: 'Text', icon: <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 3 H12 V10 L9 10 L7 12 L7 10 H2 Z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round"/></svg> },
                ].map(btn => (
                  <button key={btn.label} type="button" className="alt-tap" style={{
                    flex: 1, appearance: 'none',
                    padding: '8px 0', borderRadius: 10,
                    border: '1px solid var(--line)', background: 'var(--paper)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    color: 'var(--ink-2)',
                  }}>
                    {btn.icon}
                    <span style={{ fontSize: 11, fontWeight: 500 }}>{btn.label}</span>
                  </button>
                ))}
              </div>
              <div style={{
                marginTop: 10, paddingTop: 10, borderTop: '0.5px solid var(--line)',
                display: 'flex', justifyContent: 'space-between',
                fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)',
              }}>
                <span>{p.phone}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginLeft: 12 }}>
                  {p.email}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
