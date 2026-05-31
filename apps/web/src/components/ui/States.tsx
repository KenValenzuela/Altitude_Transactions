'use client';
import type { ReactNode } from 'react';
import { Button } from './Button';

/** Shared loading / error / empty states so every screen handles them consistently. */

function Centered({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '40px 28px',
        textAlign: 'center',
      }}
    >
      {children}
    </div>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <Centered>
      <span
        aria-hidden
        style={{
          width: 26,
          height: 26,
          borderRadius: 999,
          border: '2px solid var(--line-strong)',
          borderTopColor: 'var(--sage)',
          animation: 'alt-spin 0.9s linear infinite',
        }}
      />
      <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>{label}</div>
    </Centered>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Centered>
      <div className="alt-display" style={{ fontSize: 24, fontStyle: 'italic' }}>
        Something went wrong
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink-3)', maxWidth: 300 }}>{message}</div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </Centered>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <Centered>
      <div className="alt-display" style={{ fontSize: 24, fontStyle: 'italic' }}>
        {title}
      </div>
      {body && <div style={{ fontSize: 13, color: 'var(--ink-3)', maxWidth: 300 }}>{body}</div>}
      {action}
    </Centered>
  );
}
