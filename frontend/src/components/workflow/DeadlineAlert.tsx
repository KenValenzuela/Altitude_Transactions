import type { Deadline } from '@/types/domain';
export function DeadlineAlert({deadline}:{deadline?:Deadline}){if(!deadline)return null;return <div className="deadline-alert"><strong>Next contractual deadline:</strong> {deadline.eventName || deadline.event} · {deadline.dueDate || deadline.rawValue || deadline.dueTime}</div>}
