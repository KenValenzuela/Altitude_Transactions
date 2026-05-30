import type { AuditEvent } from '@/types/domain';
export function AuditTimeline({events}:{events:AuditEvent[]}){return <ol className="audit-timeline">{events.map(e=><li key={e.id}><strong>{e.eventType.replaceAll('_',' ')}</strong><span>{new Date(e.createdAt).toLocaleString()}</span><p>{e.entityType} {e.afterValue?`→ ${e.afterValue}`:''}</p></li>)}</ol>}
