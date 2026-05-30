import Link from 'next/link';
import type { TransactionCard as CardType } from '@/types/domain';
import { StatusBadge } from './StatusBadge';

export function TransactionCard({ transaction }: { transaction: CardType }) {
  const progressPercent = Math.round(transaction.progress * 100);

  return (
    <article className="transaction-card ops-card">
      <div>
        <p className="eyebrow">{transaction.city}</p>
        <h3>
          <Link href={`/transactions/${transaction.id}`}>{transaction.address}</Link>
        </h3>
        <p>{transaction.next}</p>
      </div>
      <dl className="transaction-card__meta">
        <div>
          <dt>Parties</dt>
          <dd>{transaction.parties || 'Parties pending'}</dd>
        </div>
        <div>
          <dt>Price</dt>
          <dd>${transaction.price.toLocaleString()}</dd>
        </div>
      </dl>
      <div className="transaction-card__footer">
        <StatusBadge label={transaction.urgent ? 'Needs attention' : transaction.stage} tone={transaction.urgent ? 'warning' : 'gold'} />
        <span>{progressPercent}% complete</span>
      </div>
      <progress value={transaction.progress} max={1} aria-label={`${transaction.address} is ${progressPercent}% complete`} />
    </article>
  );
}
