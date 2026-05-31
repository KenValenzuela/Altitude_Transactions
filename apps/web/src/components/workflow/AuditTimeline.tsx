import type { ActivityLogItem } from '@/types/domain';

export function AuditTimeline({ events }: { events: ActivityLogItem[] }) {
  if (!events.length) {
    return <p className="muted">No activity has been recorded yet.</p>;
  }

  return (
    <ol className="audit-timeline" aria-label="Transaction activity log">
      {events.map((event) => (
        <li key={event.id}>
          <strong>{event.eventType.replaceAll('_', ' ')}</strong>
          <time dateTime={event.createdAt}>{new Date(event.createdAt).toLocaleString()}</time>
          <p>
            {event.entityType}
            {event.afterValue ? ` → ${event.afterValue}` : ''}
          </p>
        </li>
      ))}
    </ol>
  );
}
