import {getTransaction} from '@/lib/product-data';
import {PageHeader} from '@/components/product/ProductComponents';

export default async function TransactionFinancial({params}: {params: Promise<{id: string}>}) {
  await params;
  return <><PageHeader eyebrow="Financial" title="Financial review workspace">Settlement statement checks, earnest money verification, loan conditions, and financial field changes should enter review before becoming authoritative.</PageHeader><div className="at-card"><h2>Phase 1 financial controls</h2><p>Financial extraction is represented as human-reviewed review items. AI must not verify wire instructions or make final compliance judgments.</p></div></>;
}
