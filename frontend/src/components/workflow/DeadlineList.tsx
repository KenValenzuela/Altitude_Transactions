import type { Deadline } from '@/types/domain';
import { DeadlineBadge } from './DeadlineBadge';

export function DeadlineList({ deadlines }: { deadlines: Deadline[] }) {
  if (!deadlines.length) {
    return <p className="muted">No deadlines have been generated yet.</p>;
  }

  return (
    <ul className="list-stack" aria-label="Transaction deadlines">
      {deadlines.map((deadline) => (
        <li className="ops-row" key={deadline.id}>
          <div>
            <strong>{deadline.eventName || deadline.event}</strong>
            <p>{[deadline.sectionReference, deadline.sourceSection].filter(Boolean).join(' · ') || 'Source pending'}</p>
          </div>
          <time>{deadline.dueDate || deadline.dueTime || deadline.rawValue || 'Date pending'}</time>
          <DeadlineBadge deadline={deadline} />
        </li>
      ))}
    </ul>
  );
}
