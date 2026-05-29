import type { ChecklistState, StateCfg } from '@/types';

export const STATE_CFG: Record<ChecklistState, StateCfg> = {
  todo:  { label: 'Not Started',    bg: 'var(--slate-soft)', fg: 'var(--slate)',     dot: '#9AA1A8' },
  doing: { label: 'In Progress',    bg: 'var(--gold-soft)',  fg: 'var(--gold)',      dot: '#C99A3F' },
  done:  { label: 'Complete',       bg: 'var(--sage-soft)',  fg: 'var(--sage-deep)', dot: 'var(--sage)' },
  na:    { label: 'Not Applicable', bg: 'var(--na-soft)',    fg: 'var(--na)',        dot: '#B9B6A9' },
};

export function nextState(s: ChecklistState): ChecklistState {
  const map: Record<ChecklistState, ChecklistState> = {
    todo: 'doing', doing: 'done', done: 'na', na: 'todo',
  };
  return map[s];
}
