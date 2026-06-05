import {getTransaction} from '@/lib/product-data';
import {PageHeader, ReviewQueue} from '@/components/product/ProductComponents';

export default async function TransactionReview({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const transaction = getTransaction(id);
  return <><PageHeader eyebrow="Review" title="Human-approved change queue">AI-assisted extracted values never become authoritative until Brett approves, rejects, edits, or adds a note.</PageHeader><ReviewQueue items={transaction.reviewItems}/></>;
}
