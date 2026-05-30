'use client';

import type { Task, TaskStatus } from '@/types/domain';
import { Button } from './Button';

const statusOrder: TaskStatus[] = ['not_started', 'in_progress', 'complete'];

function nextStatus(status: TaskStatus): TaskStatus {
  if (status === 'not_applicable' || status === 'na') return 'not_started';
  const current = statusOrder.indexOf(status);
  return statusOrder[(current + 1) % statusOrder.length] ?? 'in_progress';
}

export function getNextTaskStatus(task: Task): TaskStatus {
  return nextStatus(task.status || task.state || 'not_started');
}

export function TaskStatusToggle({ task, onToggle }: { task: Task; onToggle?: (task: Task) => void }) {
  const status = task.status || task.state || 'not_started';
  const next = getNextTaskStatus(task);

  return (
    <Button onClick={() => onToggle?.(task)} variant="secondary" aria-label={`Change ${task.title} from ${status} to ${next}`}>
      {status.replaceAll('_', ' ')}
    </Button>
  );
}
