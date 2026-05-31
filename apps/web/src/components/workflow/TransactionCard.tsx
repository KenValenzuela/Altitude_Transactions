import Link from 'next/link';
import type { TransactionCard as CardType } from '@/types/domain';

function HouseThumb() {
  return (
    <div className="dk-deal-thumb">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brass-400)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
        <path d="M9 21V12h6v9"/>
      </svg>
    </div>
  );
}

function DotIndicator({ tone }: { tone: string }) {
  const colors: Record<string, string> = {
    warn:    'var(--warn)',
    ok:      'var(--brass-500)',
    risk:    'var(--risk)',
    neutral: 'var(--paper-300)',
  };
  return (
    <span style={{
      width: 8, height: 8, borderRadius: '50%',
      background: colors[tone] ?? colors.neutral,
      flexShrink: 0,
      display: 'inline-block',
    }} aria-hidden="true" />
  );
}

function StatusChip({ label, tone }: { label: string; tone: string }) {
  const map: Record<string, { bg: string; fg: string; bd: string }> = {
    warn:    { bg: 'var(--warn-surface)',    fg: 'var(--warn-text)',    bd: 'var(--warn-line)' },
    ok:      { bg: 'var(--ok-surface)',      fg: 'var(--ok-text)',      bd: 'var(--ok-line)' },
    risk:    { bg: 'var(--risk-surface)',    fg: 'var(--risk-text)',    bd: 'var(--risk-line)' },
    neutral: { bg: 'var(--neutral-surface)', fg: 'var(--neutral)',      bd: 'var(--neutral-line)' },
  };
  const t = map[tone] ?? map.neutral;
  return (
    <span className="dk-badge" style={{ background: t.bg, color: t.fg, borderColor: t.bd }}>
      {label}
    </span>
  );
}

function ProgressBar({ value, tone }: { value: number; tone: string }) {
  const colors: Record<string, string> = {
    warn:    'var(--warn)',
    ok:      'var(--brass-500)',
    risk:    'var(--risk)',
    neutral: 'var(--paper-300)',
  };
  const fill = colors[tone] ?? colors.neutral;
  return (
    <div style={{ height: 5, background: 'var(--paper-200)', borderRadius: 99, overflow: 'hidden', marginTop: 5 }}>
      <div style={{ height: '100%', width: `${value}%`, background: fill, borderRadius: 99, transition: 'width .4s' }} />
    </div>
  );
}

function deriveTone(t: CardType): string {
  if (t.urgent) return 'risk';
  const stage = (t.stage ?? '').toLowerCase();
  if (stage.includes('closed') || stage.includes('clear')) return 'ok';
  if (stage.includes('review')) return 'warn';
  return 'neutral';
}

export function TransactionCard({ transaction: t }: { transaction: CardType }) {
  const pct = Math.round(t.progress * 100);
  const tone = deriveTone(t);

  return (
    <Link
      href={`/transactions/${t.id}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <article
        className="dk-card"
        style={{ transition: 'transform .18s, box-shadow .18s, border-color .18s', cursor: 'pointer' }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = '';
          (e.currentTarget as HTMLElement).style.boxShadow = '';
        }}
      >
        {/* Top edge color accent */}
        <div style={{ height: 3, background: tone === 'ok' ? 'var(--brass-500)' : tone === 'warn' ? 'var(--warn)' : tone === 'risk' ? 'var(--risk)' : 'var(--paper-300)' }} />

        <div className="dk-deal" style={{ gridTemplateColumns: '44px 1fr auto', padding: '14px 16px' }}>
          <HouseThumb />

          <div style={{ minWidth: 0 }}>
            <div className="dk-deal-addr">{t.address}</div>
            <div className="dk-deal-sub">{t.city} · {t.stage} · ${t.price.toLocaleString()}</div>
            <div className="dk-deal-id">{t.id}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <StatusChip label={t.urgent ? 'Deadline Risk' : (t.stage ?? 'Active')} tone={tone} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg3)' }}>{pct}%</span>
          </div>
        </div>

        <div style={{ padding: '0 16px 14px' }}>
          <ProgressBar value={pct} tone={tone} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, color: 'var(--fg3)' }}>
              {t.parties || 'Pending parties'}
            </span>
            {t.next && (
              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12, color: t.urgent ? 'var(--risk-text)' : 'var(--fg3)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <DotIndicator tone={tone} />
                {t.next}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
