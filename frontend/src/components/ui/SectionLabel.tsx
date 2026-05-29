import type { CSSProperties, ReactNode } from 'react';

interface SectionLabelProps {
  children: ReactNode;
  action?: ReactNode;
  style?: CSSProperties;
}

export function SectionLabel({ children, action, style }: SectionLabelProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      padding: '18px 20px 8px', ...(style || {}),
    }}>
      <div className="alt-eyebrow">{children}</div>
      {action && <div style={{
        fontFamily: 'var(--f-sans)', fontSize: 12, color: 'var(--sage-deep)',
        fontWeight: 500,
      }}>{action}</div>}
    </div>
  );
}
