import type { ChecklistState } from '@/types';
import { STATE_CFG } from '@/lib/state';

interface StatePillProps {
  state: ChecklistState;
  compact?: boolean;
}

export function StatePill({ state, compact = false }: StatePillProps) {
  const c = STATE_CFG[state] ?? STATE_CFG.todo;
  return (
    <span className="alt-pill" style={{
      background: c.bg, color: c.fg,
      fontFamily: 'var(--f-sans)',
      textDecoration: state === 'na' ? 'line-through' : 'none',
      textDecorationColor: 'rgba(0,0,0,.18)',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: 999, background: c.dot,
        boxShadow: state === 'doing' ? '0 0 0 2px rgba(201,154,63,.18)' : 'none',
        display: 'inline-block',
      }} />
      {!compact && c.label}
    </span>
  );
}
