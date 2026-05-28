import type { Stage } from '@/types';

interface StageRailProps {
  stages: Stage[];
}

export function StageRail({ stages }: StageRailProps) {
  return (
    <div style={{ padding: '6px 16px 14px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', left: 8, right: 8, top: 7, height: 1.5,
          background: 'var(--line)',
        }}/>
        {stages.map((s) => {
          const isDone = s.done;
          const isCurrent = s.current;
          return (
            <div key={s.id} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              flex: 1, position: 'relative', zIndex: 1, gap: 6,
            }}>
              <div style={{
                width: 14, height: 14, borderRadius: 999,
                background: isCurrent ? 'var(--gold)' : isDone ? 'var(--sage)' : 'var(--paper)',
                border: `1.5px solid ${isCurrent ? 'var(--gold)' : isDone ? 'var(--sage)' : 'var(--line-strong)'}`,
                boxShadow: isCurrent ? '0 0 0 4px rgba(182,139,60,.18)' : 'none',
              }}/>
              <div style={{
                fontSize: 9, color: isCurrent ? 'var(--ink)' : 'var(--ink-3)',
                fontWeight: isCurrent ? 600 : 400,
                textAlign: 'center', lineHeight: 1.1,
                fontFamily: 'var(--f-sans)',
                maxWidth: 50,
              }}>{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
