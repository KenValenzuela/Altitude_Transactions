import type { Deadline } from '@/types/domain';

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, opacity: 0.85 }}>
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

export function DeadlineAlert({ deadline }: { deadline?: Deadline }) {
  if (!deadline) return null;

  return (
    <aside
      className="deadline-alert"
      aria-label="Next contractual deadline"
      style={{ marginBottom: '1rem' }}
    >
      <div className="deadline-alert__header">
        <ClockIcon />
        <strong>Next deadline</strong>
      </div>
      <span>{deadline.eventName || deadline.event || 'Review required'}</span>
      <time>{deadline.dueDate || deadline.rawValue || deadline.dueTime || 'Date pending confirmation'}</time>
    </aside>
  );
}
