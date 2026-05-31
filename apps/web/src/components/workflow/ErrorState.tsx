import { Button } from './Button';

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <section className="ops-card error-state" role="alert">
      <div>
        <p className="eyebrow">Something needs attention</p>
        <h2>We could not load this workflow</h2>
        <p>{message}</p>
        {onRetry ? (
          <Button onClick={onRetry} variant="secondary">
            Retry
          </Button>
        ) : null}
      </div>
    </section>
  );
}
