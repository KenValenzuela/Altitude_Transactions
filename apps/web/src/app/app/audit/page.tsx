import {allAudit} from '@/lib/product-data';
import {AuditTimeline, PageHeader} from '@/components/product/ProductComponents';

export default function GlobalAuditPage() {
  return <><PageHeader eyebrow="Audit Log" title="Cross-transaction audit trail">Meaningful actions show action, entity, previous and new values, user, timestamp, source, AI involvement, and whether review was required.</PageHeader><AuditTimeline items={allAudit().map(({entry}) => entry)}/></>;
}
