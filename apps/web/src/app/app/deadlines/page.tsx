import {transactions} from '@/lib/product-data';
import {DeadlineList, PageHeader} from '@/components/product/ProductComponents';

export default function DeadlinesPage() {
  return <><PageHeader eyebrow="Deadlines" title="Cross-transaction deadline control">Every deadline stores original and current dates, amendment source, responsible party, related document/task, status, risk, notes, and audit history.</PageHeader><DeadlineList deadlines={transactions.flatMap((transaction) => transaction.deadlines)}/></>;
}
