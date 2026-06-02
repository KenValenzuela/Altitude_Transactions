'use client';

import type {Task, TaskGroup} from '@/types/domain';

function CheckIcon() {
    return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"
             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
    );
}

function DashIcon() {
    return (
        <svg width="10" height="2" viewBox="0 0 10 2" fill="none" aria-hidden="true">
            <rect width="10" height="2" rx="1" fill="white"/>
        </svg>
    );
}

const CAT_LABEL: Record<string, string> = {
    due_diligence: 'Due Diligence',
    inspection: 'Inspection',
    loan: 'Loan / Financing',
    title: 'Title',
    closing: 'Closing',
    post_close: 'Post-Close',
};

export function TaskChecklist({ groups, onToggle }: { groups: TaskGroup[]; onToggle?: (task: Task) => void }) {
    const allTasks = groups.flatMap(g => g.items.map(t => ({...t, groupKey: g.group})));

    if (!allTasks.length) {
    return <p className="muted">No generated tasks are available yet.</p>;
  }

    const byCategory: Record<string, typeof allTasks> = {};
    for (const t of allTasks) {
        const cat = t.groupKey || t.category;
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(t);
    }

  return (
      <div className="dk-tasktable">
          {Object.entries(byCategory).map(([cat, catTasks]) => (
              <div key={cat}>
                  <div className="dk-taskgroup-label" aria-hidden="true">
                      {CAT_LABEL[cat] ?? cat.replaceAll('_', ' ')}
          </div>
                  <ul className="dk-list" style={{listStyle: 'none', padding: 0, margin: 0}}>
                      {catTasks.map((task, i) => {
                          const status = task.status || task.state || 'not_started';
                          const done = status === 'complete' || status === 'done';
                          const doing = status === 'in_progress' || status === 'doing';
                          const dueDateStr = task.dueDate || task.due;

                          return (
                              <li key={task.id}>
                                  <button
                                      className={`dk-taskrow${done ? ' dk-taskrow--done' : ''}`}
                                      style={i > 0 ? {borderTop: '1px solid var(--line)'} : {}}
                                      onClick={() => onToggle?.(task)}
                                      aria-label={`${task.title}: ${status.replaceAll('_', ' ')}. Click to advance status.`}
                                      aria-pressed={done}
                                      onKeyDown={(e) => {
                                          if (e.key === 'Enter' || e.key === ' ') {
                                              e.preventDefault();
                                              onToggle?.(task);
                                          }
                                      }}
                                  >
                    <span className={`dk-taskcheck${done ? ' on' : doing ? ' mid' : ''}`} aria-hidden="true">
                      {done ? <CheckIcon/> : doing ? <DashIcon/> : null}
                    </span>
                                      <span className="dk-taskrow-body">
                      <span className={`dk-taskrow-title${done ? ' done' : ''}`}>{task.title}</span>
                    </span>
                                      {dueDateStr && (
                                          <time className="dk-taskrow-date" dateTime={dueDateStr}>{dueDateStr}</time>
                                      )}
                                  </button>
                              </li>
                          );
                      })}
                  </ul>
              </div>
          ))}
      </div>
  );
}
