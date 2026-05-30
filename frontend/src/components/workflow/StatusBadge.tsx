type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'gold' | 'info';

export function StatusBadge({ label, tone = 'neutral' }: { label: string; tone?: StatusTone }) {
  return (
    <span className={`status-badge ${tone}`}>
      {label.replaceAll('_', ' ')}
    </span>
  );
}
