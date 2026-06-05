import {getTransaction} from '@/lib/product-data';
import {DeadlineList, PageHeader} from '@/components/product/ProductComponents';

export default async function TransactionDeadlines({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const transaction = getTransaction(id);
  return <><PageHeader eyebrow="Deadlines" title="Original dates, current dates, and amendment history">Never overwrite original deadlines; changes store current date, amendment ID, approver, approval time, notes, and related document/task.</PageHeader><DeadlineList deadlines={transaction.deadlines}/></>;
}
