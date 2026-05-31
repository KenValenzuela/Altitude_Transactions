type StatusTone = 'neutral' | 'success' | 'ok' | 'warning' | 'warn' | 'danger' | 'risk' | 'gold' | 'info';

const toneMap: Record<StatusTone, { bg: string; fg: string; bd: string }> = {
  neutral: { bg: 'var(--neutral-surface)', fg: 'var(--neutral)',   bd: 'var(--neutral-line)' },
  ok:      { bg: 'var(--ok-surface)',      fg: 'var(--ok-text)',   bd: 'var(--ok-line)' },
  success: { bg: 'var(--ok-surface)',      fg: 'var(--ok-text)',   bd: 'var(--ok-line)' },
  warn:    { bg: 'var(--warn-surface)',    fg: 'var(--warn-text)', bd: 'var(--warn-line)' },
  warning: { bg: 'var(--warn-surface)',    fg: 'var(--warn-text)', bd: 'var(--warn-line)' },
  risk:    { bg: 'var(--risk-surface)',    fg: 'var(--risk-text)', bd: 'var(--risk-line)' },
  danger:  { bg: 'var(--risk-surface)',    fg: 'var(--risk-text)', bd: 'var(--risk-line)' },
  gold:    { bg: 'var(--brass-100)',       fg: 'var(--brass-700)', bd: 'var(--brass-300)' },
  info:    { bg: 'var(--info-surface)',    fg: 'var(--info-text)', bd: 'var(--info-line)' },
};

export function StatusBadge({ label, tone = 'neutral' }: { label: string; tone?: StatusTone }) {
  const t = toneMap[tone] ?? toneMap.neutral;
  return (
    <span
      className="dk-badge"
      style={{ background: t.bg, color: t.fg, borderColor: t.bd }}
    >
      {label.replaceAll('_', ' ')}
    </span>
  );
}
