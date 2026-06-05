import {getTransaction} from '@/lib/product-data';
import {DocumentChecklist, PageHeader} from '@/components/product/ProductComponents';

export default async function TransactionDocuments({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const transaction = getTransaction(id);
  return <><PageHeader eyebrow="Documents" title="Checklist-based document workflow">Rows support Upload, Review, Approve, Mark N/A, Add note, Replace file, status, timestamps, uploader, approver, and related deadline/task context.</PageHeader><DocumentChecklist documents={transaction.documents}/></>;
}
