import Link from 'next/link';

type EmptyStateProps = {
  title?: string;
  message?: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EmptyState({
  title = 'Nothing here yet',
  message = 'Once work is available, it will appear here with the next recommended action.',
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <section className="ops-card empty-state" aria-live="polite">
      <div>
        <p className="eyebrow">Empty state</p>
        <h2>{title}</h2>
        <p>{message}</p>
        {actionHref && actionLabel ? (
          <Link className="ops-button ops-button--primary" href={actionHref}>
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
