'use client';
import type { ChecklistState } from '@/types';
import { STATE_CFG } from '@/lib/state';

interface StateCellProps {
  state: ChecklistState;
  onClick?: () => void;
  size?: number;
}

export function StateCell({ state, onClick, size = 26 }: StateCellProps) {
  const c = STATE_CFG[state] ?? STATE_CFG.todo;
  const isDone = state === 'done';
  const isNA = state === 'na';
  const isDoing = state === 'doing';

  return (
    <button
      type="button"
      onClick={onClick}
      className="alt-tap"
      style={{
        appearance: 'none',
        width: size, height: size, minWidth: size,
        borderRadius: 999,
        border: `1.5px solid ${isDone ? 'var(--sage)' : isDoing ? 'var(--gold)' : isNA ? 'var(--na)' : 'var(--line-strong)'}`,
        background: isDone ? 'var(--sage)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 0, cursor: onClick ? 'pointer' : 'default',
      }}
      aria-label={c.label}
    >
      {isDone && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6.2 5 8.5 9.5 3.8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {isDoing && (
        <svg width="14" height="14" viewBox="0 0 14 14">
          <circle cx="7" cy="7" r="3" fill="var(--gold)" />
        </svg>
      )}
      {isNA && (
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path d="M3 6h6" stroke="var(--na)" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      )}
    </button>
  );
}
