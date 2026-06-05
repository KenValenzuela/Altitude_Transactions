import {getTransaction} from '@/lib/product-data';
import {AuditTimeline, PageHeader} from '@/components/product/ProductComponents';

export default async function TransactionAudit({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const transaction = getTransaction(id);
  return <><PageHeader eyebrow="Audit Log" title="Transaction history">Every meaningful action is auditable with previous/new values, user, timestamp, source, AI involvement, and review requirement.</PageHeader><AuditTimeline items={transaction.audit}/></>;
}
