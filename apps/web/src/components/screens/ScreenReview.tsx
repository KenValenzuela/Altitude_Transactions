'use client';
import { useState } from 'react';
import type { GoFn } from '@/types';
import type { ExtractionJob } from '@/types/api';
import { DEMO_EXTRACTION } from '@/lib/fixtures';
import { formatDateShort } from '@/lib/format';
import { AIBadge } from '@/components/ui/AIBadge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/icons';
import { IconButton } from '@/components/ui/IconButton';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { TopBar } from '@/components/ui/TopBar';

interface ScreenReviewProps {
  go: GoFn;
  job?: ExtractionJob;
  /** Commit the confirmed extraction → builds the transaction. Defaults to go('overview'). */
  onConfirm?: (confirmedFieldIds: string[]) => void | Promise<void>;
  busy?: boolean;
}

export function ScreenReview({ go, job = DEMO_EXTRACTION, onConfirm, busy = false }: ScreenReviewProps) {
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  const findings = job.fields;
  const deadlines = job.deadlines.filter((d) => !d.isNa);

  const confirm = async () => {
    const ids = Object.keys(confirmed).filter((k) => confirmed[k]);
    if (onConfirm) await onConfirm(ids);
    else go('overview');
  };

  return (
    <>
      <TopBar
        eyebrow="Step 2 of 5 · Confirm"
        title="What we found"
        leading={<IconButton icon={Icon.back()} onClick={() => go('upload')} label="Back"/>}
        trailing={<AIBadge size="lg" label="AI · Draft"/>}
      />
      <div className="alt-screen-body alt-scroll" style={{ padding: '0 20px 120px' }}>
        <div style={{
          padding: 12, background: 'var(--sage-tint)', borderRadius: 'var(--r-sm)',
          border: '0.5px solid rgba(30,58,102,.22)',
          fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 14,
        }}>
          Tap any field to edit. Everything below comes from your contract — your name still goes on the file, so give it a once-over.
        </div>

        <SectionLabel style={{ padding: '4px 0 8px' }}>Transaction details</SectionLabel>
        <div className="alt-card" style={{ padding: 0 }}>
          {findings.map((f, i, a) => (
            <div key={f.id} className="alt-tap"
              onClick={() => setConfirmed(c => ({ ...c, [f.id]: !c[f.id] }))}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '14px 16px',
                borderBottom: i < a.length - 1 ? '0.5px solid var(--line)' : 'none',
              }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--f-mono)' }}>
                    {f.label}
                  </div>
                  <span style={{ fontSize: 9, color: 'var(--sage-deep)', fontFamily: 'var(--f-mono)' }}>
                    {Math.round(f.confidence*100)}%
                  </span>
                </div>
                <div style={{ fontSize: 14, marginTop: 4, color: 'var(--ink)' }}>{f.value}</div>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: 999,
                background: confirmed[f.id] ? 'var(--sage)' : 'transparent',
                border: `1.5px solid ${confirmed[f.id] ? 'var(--sage)' : 'var(--line-strong)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 2,
              }}>
                {confirmed[f.id] && (
                  <svg width="11" height="11" viewBox="0 0 12 12">
                    <path d="M2.5 6.2 5 8.5 9.5 3.8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>

        <SectionLabel>Deadlines extracted · {deadlines.length}</SectionLabel>
        <div className="alt-card" style={{ padding: 0 }}>
          {deadlines.map((d, i, a) => (
            <div key={d.id ?? i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px',
              borderBottom: i < a.length - 1 ? '0.5px solid var(--line)' : 'none',
            }}>
              <div style={{ minWidth: 54, padding: '6px 8px', borderRadius: 8, background: 'var(--paper-2)', textAlign: 'center' }}>
                  <div className="alt-mono" style={{
                      fontSize: 10,
                      color: 'var(--ink-3)'
                  }}>{formatDateShort(d.date ?? null).split(' ')[0]}</div>
                  <div className="alt-display"
                       style={{fontSize: 18, lineHeight: 1}}>{formatDateShort(d.date ?? null).split(' ')[1] ?? ''}</div>
              </div>
                <div style={{flex: 1, fontSize: 14}}>{d.event ?? d.eventName}</div>
              <span className="alt-pill" style={{ background: 'var(--paper-2)', color: 'var(--ink-3)', fontFamily: 'var(--f-mono)', fontSize: 10 }}>
                {d.sectionReference}
              </span>
            </div>
          ))}
        </div>

        {job.flags.length > 0 && (
          <>
            <SectionLabel>Conditional items flagged</SectionLabel>
            <div className="alt-card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {job.flags.map((it, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, marginTop: 6, flexShrink: 0, background: 'var(--gold)', display: 'inline-block' }}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{it.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.45 }}>{it.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={{
        position: 'absolute', left: 12, right: 12, bottom: 24, zIndex: 30,
        padding: '12px 14px', borderRadius: 22,
        background: 'rgba(250,247,240,0.9)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '0.5px solid var(--line)', boxShadow: 'var(--sh-2)',
        display: 'flex', gap: 10, alignItems: 'center',
      }}>
        <div style={{ flex: 1, fontSize: 12, color: 'var(--ink-3)' }}>
          {Object.values(confirmed).filter(Boolean).length} of {findings.length} confirmed
        </div>
        <Button variant="sage" onClick={confirm}>{busy ? 'Building…' : 'Build my checklist'}</Button>
      </div>
    </>
  );
}
