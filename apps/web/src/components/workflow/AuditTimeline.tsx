import type {ActivityLogItem} from '@/types/domain';

// ── Event label mapping ──────────────────────────────────────
const EVENT_LABELS: Record<string, string> = {
    transaction_created: 'Transaction created',
    transaction_status_changed: 'Transaction status changed',
    extraction_started: 'AI extraction started',
    extraction_completed: 'AI extraction complete',
    review_confirmed: 'Review confirmed',
    field_approved: 'Field approved',
    field_edited: 'Field updated',
    field_marked_not_applicable: 'Field marked N/A',
    field_marked_unavailable: 'Field marked unavailable',
    field_rejected: 'Field rejected',
    task_status_changed: 'Task updated',
    task_completed: 'Task completed',
    deadline_created: 'Deadline added',
    deadline_updated: 'Deadline updated',
    contact_created: 'Contact added',
    contact_updated: 'Contact updated',
    document_uploaded: 'Document uploaded',
    document_status_changed: 'Document status updated',
    postclose_task_status_changed: 'Post-close task updated',
    postclose_task_completed: 'Post-close task completed',
};

function humanLabel(eventType: string): string {
    return (
        EVENT_LABELS[eventType] ??
        eventType.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    );
}

// ── Event tone and icon selection ────────────────────────────
type Tone = 'default' | 'ok' | 'warn' | 'info' | 'risk';
type IconKey = 'check' | 'calendar' | 'upload' | 'person' | 'task' | 'star' | 'badge' | 'ai' | 'dot';

interface EventDisplay {
    label: string;
    tone: Tone;
    icon: IconKey;
    important: boolean;
}

function classify(event: ActivityLogItem): EventDisplay {
    const {eventType, entityType, afterValue} = event;

    if (eventType.startsWith('field_')) {
        if (eventType === 'field_approved')
            return {label: 'Field approved', tone: 'ok', icon: 'check', important: false};
        if (eventType === 'field_edited')
            return {label: 'Field updated', tone: 'info', icon: 'badge', important: true};
        if (eventType === 'field_rejected')
            return {label: 'Field rejected', tone: 'risk', icon: 'dot', important: true};
        return {label: humanLabel(eventType), tone: 'default', icon: 'dot', important: false};
    }

    if (eventType.startsWith('task_')) {
        const done = afterValue === 'complete' || afterValue === 'done';
        return {
            label: done ? 'Task completed' : 'Task updated',
            tone: done ? 'ok' : 'default',
            icon: 'task',
            important: done,
        };
    }

    if (eventType.startsWith('deadline_'))
        return {label: humanLabel(eventType), tone: 'warn', icon: 'calendar', important: true};

    if (eventType.startsWith('document_') || entityType === 'document')
        return {label: humanLabel(eventType), tone: 'info', icon: 'upload', important: true};

    if (eventType.startsWith('contact_') || entityType === 'contact')
        return {label: humanLabel(eventType), tone: 'info', icon: 'person', important: false};

    if (eventType.startsWith('extraction_') || eventType === 'review_confirmed')
        return {label: humanLabel(eventType), tone: 'info', icon: 'ai', important: true};

    if (eventType.startsWith('postclose_')) {
        const done = afterValue === 'complete';
        return {
            label: done ? 'Post-close task completed' : 'Post-close task updated',
            tone: done ? 'ok' : 'default',
            icon: done ? 'star' : 'task',
            important: done,
        };
    }

    if (eventType.startsWith('transaction_'))
        return {label: humanLabel(eventType), tone: 'info', icon: 'badge', important: true};

    return {label: humanLabel(eventType), tone: 'default', icon: 'dot', important: false};
}

// ── Date helpers ─────────────────────────────────────────────
function dayLabel(iso: string): string {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    const daysAgo = Math.floor((today.getTime() - d.getTime()) / 86_400_000);
    if (daysAgo <= 6) return d.toLocaleDateString('en-US', {weekday: 'long'});
    return d.toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'});
}

function dayKey(iso: string): string {
    return new Date(iso).toDateString();
}

function timeShort(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'});
}

// ── Inline icons ─────────────────────────────────────────────
function IcCheck() {
    return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12"/>
    </svg>;
}

function IcCalendar() {
    return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>;
}

function IcUpload() {
    return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>;
}

function IcPerson() {
    return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>;
}

function IcTask() {
    return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>;
}

function IcStar() {
    return <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>;
}

function IcBadge() {
    return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="7"/>
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
    </svg>;
}

function IcAi() {
    return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>;
}

function EventIcon({icon, tone}: { icon: IconKey; tone: Tone }) {
    const map: Record<IconKey, JSX.Element> = {
        check: <IcCheck/>,
        calendar: <IcCalendar/>,
        upload: <IcUpload/>,
        person: <IcPerson/>,
        task: <IcTask/>,
        star: <IcStar/>,
        badge: <IcBadge/>,
        ai: <IcAi/>,
        dot: <span
            style={{width: 7, height: 7, borderRadius: '50%', background: 'currentColor', display: 'inline-block'}}/>,
    };
    return <span className={`dk-actevent-icon dk-actevent-icon--${tone}`}>{map[icon]}</span>;
}

// ── Activity summary ─────────────────────────────────────────
function Summary({events}: { events: ActivityLogItem[] }) {
    const fieldsReviewed = events.filter((e) =>
        ['field_approved', 'field_edited', 'field_marked_not_applicable', 'field_marked_unavailable'].includes(e.eventType),
    ).length;

    const tasksCompleted = events.filter(
        (e) =>
            (e.eventType === 'task_status_changed' || e.eventType === 'task_completed') &&
            (e.afterValue === 'complete' || e.afterValue === 'done'),
    ).length;

    const deadlineUpdates = events.filter((e) => e.eventType.startsWith('deadline_')).length;
    const docUploads = events.filter(
        (e) => e.eventType === 'document_uploaded' || e.eventType.startsWith('document_'),
    ).length;

    const importantRecent = events.filter((e) => classify(e).important).slice(0, 3);

    const stats: { n: number; l: string }[] = [];
    if (fieldsReviewed > 0) stats.push({n: fieldsReviewed, l: 'Fields reviewed'});
    if (tasksCompleted > 0) stats.push({n: tasksCompleted, l: 'Tasks completed'});
    if (deadlineUpdates > 0) stats.push({n: deadlineUpdates, l: 'Deadline updates'});
    if (docUploads > 0) stats.push({n: docUploads, l: 'Document events'});
    stats.push({n: events.length, l: 'Total events'});

    return (
        <div className="dk-actsummary" aria-label="Activity summary">
            <div className="dk-actsummary-head">Activity summary</div>
            <div className="dk-actsummary-grid">
                {stats.map((s) => (
                    <div key={s.l} className="dk-actsummary-stat">
                        <div className="dk-actsummary-n">{s.n}</div>
                        <div className="dk-actsummary-l">{s.l}</div>
                    </div>
                ))}
            </div>

            {importantRecent.length > 0 && (
                <div className="dk-actsummary-recent">
                    <div className="dk-actsummary-recent-label">Recent notable actions</div>
                    {importantRecent.map((event) => {
                        const {label, tone} = classify(event);
                        const dotColor =
                            tone === 'ok' ? 'var(--ok)' :
                                tone === 'warn' ? 'var(--warn)' :
                                    tone === 'risk' ? 'var(--risk)' :
                                        tone === 'info' ? 'var(--info)' :
                                            'var(--fg3-on-navy)';
                        const entity = event.entityType ? ` — ${event.entityType.replaceAll('_', ' ')}` : '';
                        return (
                            <div key={event.id} className="dk-actsummary-recent-item">
                                <span className="dk-actsummary-dot" style={{background: dotColor}} aria-hidden="true"/>
                                {label}{entity}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── Main component ────────────────────────────────────────────
export function AuditTimeline({ events }: { events: ActivityLogItem[] }) {
  if (!events.length) {
      return (
          <div className="empty-state">
              <p className="body-sm muted">No activity has been recorded yet.</p>
          </div>
      );
  }

    // Group by calendar day
    const grouped = new Map<string, { label: string; items: ActivityLogItem[] }>();
    for (const event of events) {
        const k = dayKey(event.createdAt);
        if (!grouped.has(k)) grouped.set(k, {label: dayLabel(event.createdAt), items: []});
        grouped.get(k)!.items.push(event);
    }

    return (
        <div>
            <Summary events={events}/>

            <div className="dk-list dk-actfeed" aria-label="Transaction activity log">
                {Array.from(grouped.entries()).map(([key, group]) => (
                    <div key={key}>
                        <div className="dk-actday" role="heading" aria-level={3}>{group.label}</div>

                        {group.items.map((event) => {
                            const display = classify(event);

                            // Build a readable detail line
                            const detail = [
                                event.entityType ? event.entityType.replaceAll('_', ' ') : '',
                                event.actorType === 'system' ? 'System' : event.actorType === 'broker' ? 'Broker' : event.actorType || '',
                            ]
                                .filter(Boolean)
                                .join(' · ');

                            // Show value change only when both values are short enough to be readable
                            const showChange =
                                event.beforeValue && event.afterValue &&
                                event.beforeValue.length <= 32 &&
                                event.afterValue.length <= 32;

                            return (
                                <div key={event.id} className="dk-actevent">
                                    <EventIcon icon={display.icon} tone={display.tone}/>
                                    <div className="dk-actevent-body">
                                        <div className="dk-actevent-label">{display.label}</div>
                                        {detail && <div className="dk-actevent-detail">{detail}</div>}
                                        {showChange && (
                                            <div className="dk-actevent-change">
                                                &ldquo;{event.beforeValue}&rdquo; → &ldquo;{event.afterValue}&rdquo;
                                            </div>
                                        )}
                                    </div>
                                    <time className="dk-actevent-time" dateTime={event.createdAt}>
                                        {timeShort(event.createdAt)}
                                    </time>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
  );
}
