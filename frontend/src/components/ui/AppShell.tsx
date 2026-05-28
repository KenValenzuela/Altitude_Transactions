'use client';
import type { ReactNode } from 'react';

/**
 * Mobile-first application shell.
 *
 * Replaces the prototype's decorative `PhoneShell`. On phones it fills the
 * viewport; on larger screens it centers a single phone-width column so the
 * mobile-first layout stays the canonical experience. It is the positioning
 * context for screens' sticky top bars and absolute bottom action bars.
 */
export function AppShell({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--bone)',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        data-theme={dark ? 'dark' : undefined}
        className="alt-screen"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 480,
          minHeight: '100dvh',
          height: '100dvh',
          overflow: 'hidden',
          background: 'var(--bone)',
          boxShadow: '0 0 0 1px var(--line)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
