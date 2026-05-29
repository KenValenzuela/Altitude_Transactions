interface AvatarProps {
  initials: string;
  color?: string;
  size?: number;
}

export function Avatar({ initials, color = 'var(--ink-3)', size = 36 }: AvatarProps) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 999,
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--f-sans)', fontWeight: 500, fontSize: size * 0.36,
      flexShrink: 0,
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.18)',
    }}>{initials}</div>
  );
}
