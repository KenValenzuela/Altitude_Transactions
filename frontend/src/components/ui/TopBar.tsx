import type { ReactNode } from 'react';

interface TopBarProps {
  title?: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  sticky?: boolean;
  large?: boolean;
  eyebrow?: string;
}

export function TopBar({ title, subtitle, leading, trailing, sticky = true, large = false, eyebrow }: TopBarProps) {
  return (
    <div style={{
      paddingTop: 58, paddingLeft: 20, paddingRight: 20, paddingBottom: 10,
      background: 'var(--bone)',
      position: sticky ? 'sticky' : 'relative', top: 0, zIndex: 20,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        minHeight: 36, gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{leading}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{trailing}</div>
      </div>
      {eyebrow && <div className="alt-eyebrow" style={{ marginTop: 14 }}>{eyebrow}</div>}
      {title && (
        <div className="alt-display" style={{
          fontSize: large ? 36 : 28,
          marginTop: eyebrow ? 4 : 14,
          color: 'var(--ink)',
          fontStyle: large ? 'italic' : 'normal',
        }}>{title}</div>
      )}
      {subtitle && (
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>{subtitle}</div>
      )}
    </div>
  );
}
