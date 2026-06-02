import type {Deadline} from '@/types/domain';

function urgencyColor(dl: Deadline): string {
    if (dl.applicability === 'completed') return 'var(--ok)';
    if (dl.applicability === 'not_applicable') return 'var(--neutral)';
    return dl.isUrgent ? 'var(--risk)' : 'var(--warn)';
}

function urgencyLabel(dl: Deadline): string {
    if (dl.applicability === 'completed') return 'Complete';
    if (dl.applicability === 'not_applicable') return 'N/A';
    return dl.isUrgent ? 'Urgent' : 'Open';
}

function urgencyBadge(dl: Deadline): string {
    if (dl.applicability === 'completed') return 'success';
    if (dl.applicability === 'not_applicable') return 'neutral';
    return dl.isUrgent ? 'danger' : 'warning';
}

export function DeadlineList({ deadlines }: { deadlines: Deadline[] }) {
  if (!deadlines.length) {
    return <p className="muted">No deadlines have been generated yet.</p>;
  }

  return (
      <div className="dk-list" aria-label="Transaction deadlines">
          {deadlines.map((dl) => {
              const dateStr = dl.dueDate || dl.date || dl.dueTime || dl.rawValue;
              return (
                  <div key={dl.id} className="dk-compactrow">
            <span
                className="dk-compactrow-dot"
                style={{background: urgencyColor(dl)}}
                aria-label={urgencyLabel(dl)}
                title={urgencyLabel(dl)}
            />
                      <div className="dk-compactrow-body">
                          <div className="dk-compactrow-title">{dl.eventName || dl.event}</div>
                          <div className="dk-compactrow-sub">
                              {[dl.sectionReference, dl.sourceSection].filter(Boolean).join(' · ') || 'Source pending'}
                          </div>
                      </div>
                      <div className="dk-compactrow-right">
                          {dateStr && (
                              <time className="dk-taskrow-date">{dateStr}</time>
                          )}
                          <span className={`status-badge ${urgencyBadge(dl)}`} style={{fontSize: 11}}>
                {urgencyLabel(dl)}
              </span>
                      </div>
                  </div>
              );
          })}
      </div>
  );
}
