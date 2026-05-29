'use client';
import type { ReactNode } from 'react';

interface IconButtonProps {
  icon: ReactNode;
  onClick?: () => void;
  badge?: string | number;
  label?: string;
}

export function IconButton({ icon, onClick, badge, label }: IconButtonProps) {
  return (
    <button type="button" onClick={onClick}
      aria-label={label}
      className="alt-tap"
      style={{
        appearance: 'none', width: 36, height: 36, borderRadius: 999,
        border: '1px solid var(--line)', background: 'var(--paper)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--ink-2)', position: 'relative',
      }}>
      {icon}
      {badge && (
        <span style={{
          position: 'absolute', top: -2, right: -2,
          minWidth: 14, height: 14, padding: '0 4px',
          background: 'var(--clay)', color: '#fff',
          borderRadius: 999, fontSize: 9, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          border: '1.5px solid var(--bone)',
        }}>{badge}</span>
      )}
    </button>
  );
}
