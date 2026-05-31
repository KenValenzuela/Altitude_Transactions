import type { Deadline } from '@/types/domain';
import { StatusBadge } from './StatusBadge';

export function DeadlineBadge({ deadline }: { deadline: Deadline }) {
  if (deadline.applicability === 'completed') return <StatusBadge label="Complete" tone="success" />;
  if (deadline.applicability === 'not_applicable') return <StatusBadge label="N/A" tone="neutral" />;
  return <StatusBadge label={deadline.isUrgent ? 'Urgent' : 'Open'} tone="warning" />;
}
