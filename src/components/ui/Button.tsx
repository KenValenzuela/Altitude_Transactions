'use client';
import type { CSSProperties, ReactNode } from 'react';

type Variant = 'primary' | 'sage' | 'secondary' | 'ghost' | 'clay';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  onClick?: () => void;
  icon?: ReactNode;
  full?: boolean;
  style?: CSSProperties;
}

const sizes: Record<Size, { h: number; px: number; fs: number; gap: number }> = {
  sm: { h: 32, px: 12, fs: 13, gap: 6 },
  md: { h: 44, px: 18, fs: 15, gap: 8 },
  lg: { h: 52, px: 22, fs: 16, gap: 10 },
};

const variants: Record<Variant, { bg: string; fg: string; bd: string }> = {
  primary:   { bg: 'var(--ink)',    fg: 'var(--paper)', bd: 'var(--ink)' },
  sage:      { bg: 'var(--sage)',   fg: '#fff',         bd: 'var(--sage)' },
  secondary: { bg: 'var(--paper)', fg: 'var(--ink)',    bd: 'var(--line-strong)' },
  ghost:     { bg: 'transparent',  fg: 'var(--ink)',    bd: 'transparent' },
  clay:      { bg: 'var(--clay)',   fg: '#fff',         bd: 'var(--clay)' },
};

export function Button({ children, variant = 'primary', size = 'md', onClick, icon, full, style }: ButtonProps) {
  const sz = sizes[size];
  const v = variants[variant];
  return (
    <button
      type="button"
      onClick={onClick}
      className="alt-tap"
      style={{
        appearance: 'none',
        height: sz.h,
        padding: `0 ${sz.px}px`,
        borderRadius: 999,
        background: v.bg,
        color: v.fg,
        border: `1px solid ${v.bd}`,
        fontFamily: 'var(--f-sans)',
        fontSize: sz.fs,
        fontWeight: 500,
        letterSpacing: '-0.005em',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sz.gap,
        width: full ? '100%' : 'auto',
        ...(style || {}),
      }}>
      {icon}
      {children}
    </button>
  );
}
