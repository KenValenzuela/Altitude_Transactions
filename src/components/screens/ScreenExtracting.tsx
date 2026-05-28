'use client';
import { useState, useEffect } from 'react';
import type { GoFn } from '@/types';
import { AIBadge } from '@/components/ui/AIBadge';
import { Icon } from '@/components/ui/icons';

const steps = [
  'Reading contract pages…',
  'Identifying parties & property…',
  'Extracting dates and deadlines…',
  'Cross-checking CREC form references…',
  'Building checklist…',
];

export function ScreenExtracting({ go }: { go: GoFn }) {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setProgress(p => {
        const n = p + 1.6;
        if (n >= 100) { clearInterval(t); setTimeout(() => go('review'), 600); return 100; }
        return n;
      });
    }, 70);
    return () => clearInterval(t);
  }, [go]);

  useEffect(() => {
    setStep(Math.min(steps.length - 1, Math.floor((progress / 100) * steps.length)));
  }, [progress]);

  return (
    <div className="alt-screen-body" style={{
      background: 'radial-gradient(ellipse at 50% 30%, #16263F 0%, #0A1320 70%)',
      color: '#F4EFE3',
      padding: '90px 24px 40px',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: 'rgba(244,239,227,.5)',
      }}>
        <AIBadge label="AI · Reading"/>
        <span>Contract_PineRidge.pdf · 14 pp</span>
      </div>

      {/* Animated paper card */}
      <div style={{
        marginTop: 28, position: 'relative',
        height: 240, borderRadius: 18,
        background: '#F4EFE3', color: 'var(--ink)',
        padding: '20px 18px', overflow: 'hidden',
        boxShadow: '0 30px 60px rgba(0,0,0,.5)',
      }}>
        <div className="alt-eyebrow" style={{ marginBottom: 8 }}>CBS-1-4-22 · §29</div>
        <div className="alt-display" style={{ fontSize: 16, fontStyle: 'italic' }}>
          Contract to Buy and Sell Real Estate
        </div>
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 7 }}>
          {[
            { w: '88%', highlight: progress > 8 },
            { w: '62%', highlight: progress > 18, label: 'Property' },
            { w: '94%', highlight: progress > 28 },
            { w: '70%', highlight: progress > 38, label: 'Earnest $28,000' },
            { w: '85%', highlight: progress > 48 },
            { w: '74%', highlight: progress > 58, label: 'Inspection Apr 17' },
            { w: '90%', highlight: progress > 68, label: 'Appraisal Apr 22' },
            { w: '60%', highlight: progress > 78, label: 'Closing May 01' },
          ].map((row, i) => (
            <div key={i} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                height: 6, width: row.w, borderRadius: 4,
                background: row.highlight ? 'rgba(30,58,102,.32)' : 'rgba(0,0,0,.08)',
                transition: 'background .3s',
              }}/>
              {row.label && row.highlight && (
                <div style={{
                  fontFamily: 'var(--f-mono)', fontSize: 9,
                  color: 'var(--sage-deep)', letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                }}>· {row.label}</div>
              )}
            </div>
          ))}
        </div>
        {/* scanning line */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 3,
          top: `${20 + (progress * 1.8)}px`,
          background: 'linear-gradient(90deg, transparent, var(--sage), transparent)',
          boxShadow: '0 0 16px rgba(30,58,102,.55)',
          transition: 'top .07s linear',
          opacity: progress < 95 ? 1 : 0,
        }}/>
      </div>

      {/* progress + step list */}
      <div style={{ marginTop: 36 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div className="alt-display" style={{ fontSize: 26, fontStyle: 'italic', color: '#F4EFE3' }}>Working…</div>
          <div className="alt-mono" style={{ fontSize: 12, color: 'rgba(244,239,227,.55)' }}>
            {Math.round(progress)}%
          </div>
        </div>
        <div style={{ height: 3, borderRadius: 999, background: 'rgba(244,239,227,.12)', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--sage)', transition: 'width .07s linear' }}/>
        </div>
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, fontSize: 13,
              color: i < step ? 'rgba(244,239,227,.55)' : i === step ? '#F4EFE3' : 'rgba(244,239,227,.28)',
            }}>
              {i < step ? (
                <span style={{ color: 'var(--sage)' }}>{Icon.check()}</span>
              ) : i === step ? (
                <span style={{ width: 14, height: 14, display: 'inline-block', position: 'relative' }}>
                  <span style={{
                    position: 'absolute', inset: 0, borderRadius: 999,
                    border: '1.5px solid var(--sage)', borderTopColor: 'transparent',
                    animation: 'alt-spin 0.9s linear infinite',
                    display: 'block',
                  }}/>
                </span>
              ) : (
                <span style={{
                  width: 14, height: 14, borderRadius: 999,
                  border: '1.5px solid rgba(244,239,227,.18)', display: 'inline-block',
                }}/>
              )}
              {s}
            </div>
          ))}
        </div>
      </div>

      <div style={{
        marginTop: 'auto', fontSize: 11,
        color: 'rgba(244,239,227,.45)', textAlign: 'center', lineHeight: 1.5,
      }}>
        AI extracts. You review every item. Nothing files until you say so.
      </div>
    </div>
  );
}
