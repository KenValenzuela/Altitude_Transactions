export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <section className="ops-card loading-state" role="status" aria-live="polite">
      <span className="loading-dot" aria-hidden="true" />
      <p>{label}</p>
    </section>
  );
}
