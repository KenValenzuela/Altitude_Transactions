'use client';
import { useState } from 'react';
import type { GoFn } from '@/types';
import type { ApiUser } from '@/types/api';
import { DEMO_USER } from '@/lib/fixtures';
import { initialsFromName } from '@/lib/format';
import { Monogram } from '@/components/brand/Monogram';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

interface ScreenLoginProps {
  go: GoFn;
  /** The seeded broker shown on the card. Defaults to the demo broker. */
  user?: ApiUser;
  /** Establishes a session, then navigates. Defaults to the walkthrough's go(). */
  onContinue?: () => void | Promise<void>;
}

export function ScreenLogin({ go, user = DEMO_USER, onContinue }: ScreenLoginProps) {
  const [busy, setBusy] = useState(false);

  const handleContinue = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (onContinue) await onContinue();
      else go('dashboard');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="alt-screen-body alt-topo" style={{
      position: 'relative',
      padding: '90px 24px 28px',
      display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, var(--paper) 0%, var(--bone) 60%)',
    }}>
      {/* hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Monogram size={56} />
        <div className="alt-display" style={{ fontSize: 56, fontStyle: 'italic', marginTop: 24, lineHeight: 0.95 }}>
          Altitude
        </div>
        <div style={{
          fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 14,
        }}>Contract to Close — Colorado</div>
        <div style={{
          fontSize: 15, lineHeight: 1.45, color: 'var(--ink-2)',
          marginTop: 22, maxWidth: 280,
        }}>
          A calmer way to run the 30 days between offer accepted and keys delivered.
        </div>
      </div>

      {/* sign-in card */}
      <div className="alt-card" style={{ padding: 18, marginBottom: 16 }}>
        <div className="alt-eyebrow" style={{ marginBottom: 10 }}>Signed in as</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar initials={initialsFromName(user.name)} color="var(--sage-deep)" size={42}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{user.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{user.brokerage}</div>
          </div>
        </div>
        <div style={{ height: 1, background: 'var(--line)', margin: '14px 0' }}/>
        <Button full size="lg" variant="sage" onClick={handleContinue}>
          {busy ? 'Signing in…' : 'Continue to dashboard'}
        </Button>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, marginTop: 12,
          fontSize: 11, color: 'var(--ink-3)',
        }}>
          <svg width="11" height="13" viewBox="0 0 11 13" fill="none">
            <rect x="1" y="5.5" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1"/>
            <path d="M3 5.5 V3.5 A2.5 2.5 0 0 1 8 3.5 V5.5" stroke="currentColor" strokeWidth="1"/>
          </svg>
          Face ID enabled · CREC license {user.licenseNo}
        </div>
      </div>

      <div style={{
        fontSize: 11, color: 'var(--ink-3)', textAlign: 'center',
        fontFamily: 'var(--f-mono)', letterSpacing: '0.08em',
      }}>
        v0.4 · sits beside CTME · does not replace it
      </div>
    </div>
  );
}
