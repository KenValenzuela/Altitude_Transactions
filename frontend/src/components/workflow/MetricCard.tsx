import { Card } from './Card';

interface MetricCardProps {
  label: string;
  value: string | number;
  detail?: string;
  tone?: 'default' | 'warning' | 'danger' | 'success';
}

const toneColors: Record<NonNullable<MetricCardProps['tone']>, string> = {
  default: 'var(--alt-navy)',
  warning: 'var(--alt-warning)',
  danger:  'var(--alt-danger)',
  success: 'var(--alt-success)',
};

export function MetricCard({ label, value, detail, tone = 'default' }: MetricCardProps) {
  return (
    <Card className={`metric-card tone-${tone}`}>
      <p className="eyebrow">{label}</p>
      <strong
        className="metric-value"
        style={{ color: toneColors[tone] }}
      >
        {value}
      </strong>
      {detail ? <p className="muted" style={{ fontSize: '.85rem', marginTop: '.25rem' }}>{detail}</p> : null}
    </Card>
  );
}
