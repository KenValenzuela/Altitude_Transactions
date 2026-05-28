'use client';
import { useEffect, useState } from 'react';
import type { GoFn, ChecklistState } from '@/types';
import type { ApiTask, TaskState, TransactionDetail } from '@/types/api';
import { DEMO_DETAIL } from '@/lib/fixtures';
import { nextState } from '@/lib/state';
import { AIBadge } from '@/components/ui/AIBadge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/icons';
import { IconButton } from '@/components/ui/IconButton';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { StatePill } from '@/components/ui/StatePill';
import { StateCell } from '@/components/ui/StateCell';

interface ScreenPostCloseProps {
  go: GoFn;
  detail?: TransactionDetail;
  onSetState?: (taskId: string, state: TaskState) => void | Promise<void>;
}

export function ScreenPostClose({ go, detail = DEMO_DETAIL, onSetState }: ScreenPostCloseProps) {
  const postClose = detail.tasks.flatMap((g) => g.items).filter((t) => t.isPostClose);
  const [tasks, setTasks] = useState<ApiTask[]>(postClose);
  useEffect(() => {
    setTasks(postClose);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail]);

  const cycle = (task: ApiTask) => {
    const next = nextState(task.state) as TaskState;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, state: next } : t)));
    void onSetState?.(task.id, next);
  };

  const { done, na, active } = detail.counts;

  return (
    <div className="alt-screen-body alt-scroll" style={{ paddingBottom: 60 }}>
      <div style={{ position: 'relative', padding: '50px 12px 0' }}>
        <div style={{ padding: '8px 8px 12px', display: 'flex', justifyContent: 'space-between' }}>
          <IconButton icon={Icon.back()} onClick={() => go('summary')} label="Back"/>
          <div className="alt-eyebrow">{detail.city} · Closeout</div>
          <div style={{ width: 36 }}/>
        </div>
        <div style={{
          position: 'relative', height: 200,
          borderRadius: 'var(--r-md)', overflow: 'hidden',
          background: 'linear-gradient(165deg, #0E1A30 0%, #1E3A66 60%, #B8862F 130%)',
        }}>
          <svg viewBox="0 0 320 200" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <path d="M0 150 L40 116 L70 130 L110 92 L150 126 L190 108 L230 132 L270 114 L320 130 L320 200 L0 200 Z" fill="#1E3A66" opacity="0.55"/>
            <path d="M0 170 L30 158 L60 168 L100 148 L140 164 L180 150 L220 170 L260 156 L320 168 L320 200 L0 200 Z" fill="#0E1A30"/>
            <circle cx="245" cy="52" r="18" fill="#F1ECDF" opacity="0.9"/>
            {[...Array(14)].map((_, i) => (
              <circle key={i} cx={20 + (i*22)} cy={30 + ((i*7) % 35)} r={2 + ((i*3) % 3)} fill={['#F1ECDF','#B8862F','#F4EFE3'][i%3]} opacity={0.65}/>
            ))}
          </svg>
          <div style={{ position: 'absolute', left: 16, bottom: 16, right: 16, color: '#F4EFE3', textShadow: '0 1px 12px rgba(0,0,0,.3)' }}>
            <div className="alt-eyebrow" style={{ color: 'rgba(244,239,227,.7)' }}>After the keys</div>
            <div className="alt-display" style={{ fontSize: 28, fontStyle: 'italic', marginTop: 6 }}>{detail.address}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 20px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
          <span style={{ color: 'var(--sage-deep)', fontWeight: 500 }}>{done} of {active}</span> active items complete.{' '}
          <span style={{ color: 'var(--na)' }}>{na}</span> N/A.
        </div>
      </div>

      <SectionLabel>Follow-up</SectionLabel>
      <div style={{ padding: '0 20px' }}>
        {tasks.length === 0 && (
          <div className="alt-card" style={{ padding: 16, fontSize: 13, color: 'var(--ink-3)' }}>
            No post-close follow-ups yet.
          </div>
        )}
        {tasks.length > 0 && (
          <div className="alt-card" style={{ padding: 0 }}>
            {tasks.map((t, i) => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px',
                borderBottom: i < tasks.length - 1 ? '0.5px solid var(--line)' : 'none',
                opacity: t.state === 'na' ? 0.55 : 1,
              }}>
                <StateCell state={t.state as ChecklistState} onClick={() => cycle(t)}/>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 500,
                    textDecoration: t.state === 'done' ? 'line-through' : 'none',
                    textDecorationColor: 'rgba(0,0,0,.25)',
                  }}>{t.title}</div>
                  <div className="alt-mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{t.due}</div>
                </div>
                <StatePill state={t.state as ChecklistState}/>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '18px 20px 30px' }}>
        <Button full variant="secondary" onClick={() => go('dashboard')}>Back to dashboard</Button>
      </div>
    </div>
  );
}
