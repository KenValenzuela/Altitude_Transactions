type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'gold';

export function StatusBadge({ label, tone = 'neutral' }: { label: string; tone?: StatusTone }) {
  return <span className={`status-badge ${tone}`}>{label.replaceAll('_', ' ')}</span>;
}
