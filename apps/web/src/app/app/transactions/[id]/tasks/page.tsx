import {getTransaction} from '@/lib/product-data';
import {PageHeader, StatusBadge} from '@/components/product/ProductComponents';

export default async function TransactionTasks({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const transaction = getTransaction(id);
  return <><PageHeader eyebrow="Tasks" title="Transaction task checklist">Tasks stay tied to deadlines, documents, owners, and audit records.</PageHeader><div className="at-grid-2">{transaction.tasks.map((task) => <article className="at-card" key={task.id}><h2>{task.title}</h2><p>Owner: {task.owner} · Due {task.dueDate}</p>{task.relatedDeadline && <p>Related deadline: {task.relatedDeadline}</p>}<StatusBadge status={task.status}/><div className="at-row-actions"><button>Complete</button><button>Mark N/A</button><button>Add note</button></div></article>)}</div></>;
}
