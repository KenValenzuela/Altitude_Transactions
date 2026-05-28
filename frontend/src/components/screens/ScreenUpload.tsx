'use client';
import { useRef, useState } from 'react';
import type { GoFn } from '@/types';
import { AIBadge } from '@/components/ui/AIBadge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/icons';
import { IconButton } from '@/components/ui/IconButton';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { TopBar } from '@/components/ui/TopBar';

interface ScreenUploadProps {
  go: GoFn;
  /** Upload a chosen PDF. Defaults to the walkthrough's go('extracting'). */
  onUpload?: (file: File) => void | Promise<void>;
  /** Surfaced when an upload fails (e.g. wrong file type). */
  error?: string | null;
  busy?: boolean;
}

export function ScreenUpload({ go, onUpload, error, busy = false }: ScreenUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = () => {
    if (onUpload) inputRef.current?.click();
    else go('extracting');
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file && onUpload) await onUpload(file);
  };

  return (
    <>
      <TopBar
        title="New transaction"
        subtitle="Start by giving us the contract."
        leading={<IconButton icon={Icon.back()} onClick={() => go('dashboard')} label="Back"/>}
      />
      <div className="alt-screen-body alt-scroll" style={{ padding: '0 20px 24px' }}>
        <div className="alt-eyebrow" style={{ marginBottom: 8 }}>Step 1 of 5</div>

        <div className="alt-card" style={{
          padding: 24, textAlign: 'center',
          borderStyle: 'dashed', borderColor: 'var(--line-strong)',
          background: 'var(--paper)',
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: 'var(--sage-tint)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--sage-deep)', marginBottom: 16,
          }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M6 5 H18 L22 9 V22 A1 1 0 0 1 21 23 H7 A1 1 0 0 1 6 22 Z"
                stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
              <path d="M18 5 V9 H22" stroke="currentColor" strokeWidth="1.4" fill="none"/>
              <path d="M14 12 V19 M11 15 L14 12 L17 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="alt-display" style={{ fontSize: 22 }}>Drop the contract</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.45 }}>
            Contract to Buy &amp; Sell, Inspection Objection, anything from CTME.
            We&apos;ll read it and pull out the deadlines.
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={onFile}
            style={{ display: 'none' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 18 }}>
            <Button full variant="sage" onClick={pick}>
              {busy ? 'Uploading…' : 'Choose PDF from Files'}
            </Button>
            <Button full variant="secondary" onClick={pick}>Scan with camera</Button>
            <Button full variant="ghost" onClick={pick}>Paste CTME share link</Button>
          </div>
          {error && (
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--clay)', fontWeight: 500 }}>
              {error}
            </div>
          )}
        </div>

        <SectionLabel>What we&apos;ll do</SectionLabel>
        <div className="alt-card" style={{ padding: 4 }}>
          {[
            { t: 'Read the contract',    s: 'Parse parties, property, prices, dates.',                       i: <AIBadge/> },
            { t: 'Pull every deadline',  s: 'Inspection, appraisal, loan, closing — all dates with hours.', i: <AIBadge/> },
            { t: 'Build your checklist', s: 'Tasks pre-filled. You mark N/A what doesn\'t apply.',          i: undefined },
            { t: 'You review every item',s: 'Nothing official is sent or filed without your approval.',     i: undefined },
          ].map((row, i, a) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 14px',
              borderBottom: i < a.length - 1 ? '0.5px solid var(--line)' : 'none',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: 999,
                background: 'var(--paper-2)', color: 'var(--ink-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600, flexShrink: 0,
                fontFamily: 'var(--f-mono)',
              }}>{i+1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {row.t} {row.i}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{row.s}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 14, fontSize: 11, color: 'var(--ink-3)',
          textAlign: 'center', lineHeight: 1.5, fontFamily: 'var(--f-mono)',
          letterSpacing: '0.04em',
        }}>
          CTME stays the source of truth. Altitude tracks the work around it.
        </div>
      </div>
    </>
  );
}
