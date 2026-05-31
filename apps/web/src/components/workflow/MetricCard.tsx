interface MetricCardProps {
  label: string;
  value: string | number;
  detail?: string;
  subtext?: string;
  tone?: 'default' | 'warning' | 'danger' | 'success';
}

const edgeColor: Record<NonNullable<MetricCardProps['tone']>, string> = {
  default: 'var(--ink-700)',
  warning: 'var(--warn)',
  danger:  'var(--risk)',
  success: 'var(--ok)',
};

const valueColor: Record<NonNullable<MetricCardProps['tone']>, string> = {
  default: 'var(--fg1)',
  warning: 'var(--warn-text)',
  danger:  'var(--risk-text)',
  success: 'var(--ok-text)',
};

const subtextColor: Record<NonNullable<MetricCardProps['tone']>, string> = {
  default: 'var(--fg3)',
  warning: 'var(--warn-text)',
  danger:  'var(--risk-text)',
  success: 'var(--ok-text)',
};

export function MetricCard({ label, value, detail, subtext, tone = 'default' }: MetricCardProps) {
  return (
    <div className="dk-statcard">
      <div className="edge" style={{ background: edgeColor[tone] }} />
      <div className="n" style={{ color: valueColor[tone] }}>{value}</div>
      <div className="l">{label}</div>
      {(detail || subtext) && (
        <div
          className="k"
          style={{ color: subtextColor[tone] }}
        >
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: edgeColor[tone],
            flexShrink: 0,
            display: 'inline-block',
          }} />
          {detail ?? subtext}
        </div>
      )}
    </div>
  );
}
