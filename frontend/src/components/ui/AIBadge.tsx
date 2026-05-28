interface AIBadgeProps {
  size?: 'sm' | 'lg';
  label?: string;
}

export function AIBadge({ size = 'sm', label = 'AI' }: AIBadgeProps) {
  const isLg = size === 'lg';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      height: isLg ? 22 : 18,
      padding: isLg ? '0 8px' : '0 6px',
      borderRadius: 999,
      background: 'var(--sage-tint)',
      color: 'var(--sage-deep)',
      fontFamily: 'var(--f-mono)',
      fontSize: isLg ? 11 : 10,
      fontWeight: 500,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      border: '0.5px solid rgba(30,58,102,.25)',
    }}>
      <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
        <path d="M5 0.5 L6 4 L9.5 5 L6 6 L5 9.5 L4 6 L0.5 5 L4 4 Z" fill="var(--sage)" />
      </svg>
      {label}
    </span>
  );
}
