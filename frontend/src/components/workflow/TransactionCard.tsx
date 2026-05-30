import Link from 'next/link';
import type { TransactionCard as CardType } from '@/types/domain';
import { StatusBadge } from './StatusBadge';

function MountainThumb() {
  return (
    <div style={{
      width: 48, height: 48, borderRadius: 10, flexShrink: 0, overflow: 'hidden',
      background: 'linear-gradient(155deg, var(--alt-navy) 0%, var(--alt-navy-800) 100%)',
      position: 'relative',
    }}>
      <svg viewBox="0 0 48 48" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true">
        <path d="M0 36 L12 20 L20 28 L30 14 L42 26 L48 22 L48 48 L0 48 Z" fill="rgba(0,16,42,.6)" />
        <path d="M0 40 L12 24 L20 32 L30 18 L42 28 L48 24 L48 48 L0 48 Z" fill="rgba(0,16,42,.4)" />
        <circle cx="38" cy="12" r="3.5" fill="#F7ECD0" opacity="0.7" />
      </svg>
    </div>
  );
}

export function TransactionCard({ transaction }: { transaction: CardType }) {
  const progressPercent = Math.round(transaction.progress * 100);
  const isUrgent = transaction.urgent;

  return (
    <article
      className="ops-card"
      style={{
        borderLeft: isUrgent ? '3px solid var(--alt-warning)' : undefined,
        display: 'grid',
        gap: '1rem',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <MountainThumb />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="eyebrow" style={{ marginBottom: 3 }}>{transaction.city}</p>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, lineHeight: 1.3, color: 'var(--alt-navy)' }}>
            <Link
              href={`/transactions/${transaction.id}`}
              style={{
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              {transaction.address}
            </Link>
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '.85rem', color: 'var(--alt-muted)', lineHeight: 1.4 }}>
            {transaction.next}
          </p>
        </div>
        {isUrgent && (
          <span
            aria-label="Urgent"
            style={{
              width: 8, height: 8, borderRadius: 999,
              background: 'var(--alt-warning)',
              flexShrink: 0, marginTop: 4,
              boxShadow: '0 0 0 3px rgba(183,121,31,.2)',
            }}
          />
        )}
      </div>

      {/* Meta row */}
      <dl style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '.625rem',
        margin: 0,
        padding: '.875rem 1rem',
        background: 'var(--alt-bg)',
        borderRadius: '.75rem',
      }}>
        <div>
          <dt style={{ fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--alt-muted)' }}>
            Parties
          </dt>
          <dd style={{ margin: '3px 0 0', fontSize: '.9rem', fontWeight: 500 }}>
            {transaction.parties || 'Pending'}
          </dd>
        </div>
        <div>
          <dt style={{ fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--alt-muted)' }}>
            Contract price
          </dt>
          <dd style={{ margin: '3px 0 0', fontSize: '.9rem', fontWeight: 600, color: 'var(--alt-navy)' }}>
            ${transaction.price.toLocaleString()}
          </dd>
        </div>
      </dl>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem' }}>
        <StatusBadge
          label={isUrgent ? 'Needs attention' : transaction.stage}
          tone={isUrgent ? 'warning' : 'neutral'}
        />
        <span style={{ fontSize: '.8rem', color: 'var(--alt-muted)', fontWeight: 500 }}>
          {progressPercent}% complete
        </span>
      </div>
      <progress
        value={transaction.progress}
        max={1}
        aria-label={`${transaction.address} is ${progressPercent}% complete`}
      />
    </article>
  );
}
