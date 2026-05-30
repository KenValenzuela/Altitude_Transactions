'use client';
import type { CSSProperties, ReactNode } from 'react';

type Variant = 'primary' | 'gold' | 'sage' | 'secondary' | 'ghost' | 'clay';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  onClick?: () => void;
  icon?: ReactNode;
  full?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  style?: CSSProperties;
}

const sizes: Record<Size, { h: number; px: number; fs: number; gap: number }> = {
  sm: { h: 32, px: 12, fs: 13, gap: 6 },
  md: { h: 44, px: 18, fs: 15, gap: 8 },
  lg: { h: 52, px: 24, fs: 16, gap: 10 },
};

const variants: Record<Variant, { bg: string; fg: string; bd: string; hoverBg?: string }> = {
  primary:   { bg: 'var(--alt-navy-900)', fg: '#fff',              bd: 'var(--alt-navy-900)',  hoverBg: 'var(--alt-navy-800)' },
  gold:      { bg: 'var(--alt-gold)',     fg: 'var(--alt-navy)',   bd: 'var(--alt-gold)',      hoverBg: 'var(--alt-gold-dk)' },
  sage:      { bg: 'var(--alt-navy-800)', fg: '#fff',              bd: 'var(--alt-navy-800)',  hoverBg: 'var(--alt-navy)' },
  secondary: { bg: 'var(--alt-surface)', fg: 'var(--alt-navy-900)', bd: 'var(--alt-border-strong)' },
  ghost:     { bg: 'transparent',        fg: 'var(--alt-navy-900)', bd: 'transparent' },
  clay:      { bg: 'var(--alt-danger)',   fg: '#fff',              bd: 'var(--alt-danger)' },
};

export function Button({ children, variant = 'primary', size = 'md', onClick, icon, full, disabled, type = 'button', style }: ButtonProps) {
  const sz = sizes[size];
  const v = variants[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="alt-tap"
      style={{
        appearance: 'none',
        height: sz.h,
        padding: `0 ${sz.px}px`,
        borderRadius: 999,
        background: v.bg,
        color: v.fg,
        border: `1.5px solid ${v.bd}`,
        fontFamily: 'var(--f-sans)',
        fontSize: sz.fs,
        fontWeight: 600,
        letterSpacing: '-0.005em',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sz.gap,
        width: full ? '100%' : 'auto',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'background .15s, border-color .15s, opacity .15s, transform .12s',
        ...(style || {}),
      }}>
      {icon}
      {children}
    </button>
  );
}
