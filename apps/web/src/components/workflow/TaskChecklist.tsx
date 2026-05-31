import type { Task, TaskGroup } from '@/types/domain';
import { TaskStatusToggle } from './TaskStatusToggle';

export function TaskChecklist({ groups, onToggle }: { groups: TaskGroup[]; onToggle?: (task: Task) => void }) {
  const tasks = groups.flatMap((group) => group.items.map((task) => ({ ...task, group: group.group })));

  if (!tasks.length) {
    return <p className="muted">No generated tasks are available yet.</p>;
  }

  return (
    <ul className="list-stack" aria-label="Generated task checklist">
      {tasks.map((task) => (
        <li className="ops-row" key={task.id}>
          <div>
            <p className="eyebrow">{(task.group || task.category).replaceAll('_', ' ')}</p>
            <strong>{task.title}</strong>
            <p>{task.notes || task.aiNote || 'No additional notes.'}</p>
          </div>
          <time>{task.dueDate || task.due || 'No due date'}</time>
          <TaskStatusToggle task={task} onToggle={onToggle} />
        </li>
      ))}
    </ul>
  );
}
