'use client';
import type { ReactNode } from 'react';

interface TabItem {
  id: string;
  label: string;
  icon: (on: boolean) => ReactNode;
}

interface TabBarProps {
  active: string;
  onChange: (id: string) => void;
  items: TabItem[];
}

export function TabBar({ active, onChange, items }: TabBarProps) {
  return (
    <div style={{
      position: 'absolute', left: 12, right: 12, bottom: 24,
      height: 62, zIndex: 30,
      background: 'rgba(250,247,240,0.78)',
      backdropFilter: 'blur(24px) saturate(160%)',
      WebkitBackdropFilter: 'blur(24px) saturate(160%)',
      borderRadius: 22,
      border: '0.5px solid rgba(0,0,0,0.06)',
      boxShadow: '0 8px 24px rgba(20,34,63,.12), 0 1px 0 rgba(255,255,255,.6) inset',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '0 12px',
    }}>
      {items.map(it => {
        const on = active === it.id;
        return (
          <button key={it.id}
            type="button"
            onClick={() => onChange(it.id)}
            className="alt-tap"
            style={{
              appearance: 'none', border: 0, background: 'transparent',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, padding: '6px 10px', borderRadius: 10,
              color: on ? 'var(--sage-deep)' : 'var(--ink-3)',
            }}>
            <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {it.icon(on)}
            </div>
            <div style={{
              fontSize: 9.5, fontWeight: on ? 600 : 500,
              letterSpacing: '0.02em', fontFamily: 'var(--f-sans)',
            }}>{it.label}</div>
          </button>
        );
      })}
    </div>
  );
}
