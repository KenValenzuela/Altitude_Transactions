import type { CSSProperties } from 'react';

interface WordmarkProps {
  size?: number;
  color?: string;
  italic?: boolean;
}

export function Wordmark({ size = 22, color, italic = true }: WordmarkProps) {
  const style: CSSProperties = {
    fontFamily: 'var(--f-display)',
    fontSize: size,
    fontStyle: italic ? 'italic' : 'normal',
    letterSpacing: '-0.012em',
    color: color || 'var(--ink)',
    lineHeight: 1,
  };
  return <span style={style}>Altitude</span>;
}
