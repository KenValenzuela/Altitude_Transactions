import type { Deadline } from '@/types/domain';

export function DeadlineAlert({ deadline }: { deadline?: Deadline }) {
  if (!deadline) return null;

  return (
    <aside className="deadline-alert" aria-label="Next contractual deadline">
      <strong>Next contractual deadline</strong>
      <span>{deadline.eventName || deadline.event}</span>
      <time>{deadline.dueDate || deadline.rawValue || deadline.dueTime || 'Date pending'}</time>
    </aside>
  );
}
