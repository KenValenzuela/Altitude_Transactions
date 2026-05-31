interface AIBadgeProps {
  size?: 'sm' | 'lg';
  label?: string;
}

export function AIBadge({ size = 'sm', label = 'AI' }: AIBadgeProps) {
  const isLg = size === 'lg';
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: isLg ? 5 : 4,
      height: isLg ? 24 : 18,
      padding: isLg ? '0 9px' : '0 6px',
      borderRadius: 999,
      background: 'var(--alt-info-tint)',
      color: 'var(--alt-info)',
      fontFamily: 'var(--f-mono)',
      fontSize: isLg ? 11 : 10,
      fontWeight: 700,
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      border: '1px solid var(--alt-info-border)',
      flexShrink: 0,
      boxShadow: isLg ? '0 1px 4px rgba(37,99,235,.12)' : undefined,
    }}>
      <svg width={isLg ? 10 : 9} height={isLg ? 10 : 9} viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path d="M5 0.5L6.2 3.8L9.5 5L6.2 6.2L5 9.5L3.8 6.2L0.5 5L3.8 3.8Z" fill="var(--alt-info)" />
      </svg>
      {label}
    </span>
  );
}
