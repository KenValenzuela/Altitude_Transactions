import {getTransaction} from '@/lib/product-data';
import {PageHeader, StatusBadge} from '@/components/product/ProductComponents';

export default async function TransactionPostClose({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const transaction = getTransaction(id);
  return <><PageHeader eyebrow="Post-Close" title="Post-close preservation and wrap-up">Archived transactions preserve documents, audit log, deadlines, contacts, vendors, amendments, and notes.</PageHeader><div className="at-grid-2">{transaction.tasks.map((task) => <article key={task.id} className="at-card"><h2>{task.title}</h2><p>Due {task.dueDate} · Owner {task.owner}</p><StatusBadge status={task.status}/></article>)}</div></>;
}
