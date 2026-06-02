'use client';

import type {PostCloseTask} from '@/types/domain';

function IcCheck() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
    );
}

function IcArrowRight() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14"/>
            <path d="m12 5 7 7-7 7"/>
        </svg>
    );
}

function IcUndo() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 14 4 9l5-5"/>
            <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>
        </svg>
    );
}

interface Props {
    tasks: PostCloseTask[];
    onToggle: (task: PostCloseTask) => void;
}

function KanbanCard({task, onToggle}: { task: PostCloseTask; onToggle: (t: PostCloseTask) => void }) {
    const done = task.status === 'complete';
    const na = task.status === 'not_applicable';

    return (
        <article
            className={`dk-kcard${done ? ' dk-kcard--done' : ''}`}
            aria-label={`${task.title}${done ? ' — completed' : ''}`}
        >
            <div className="dk-kcard-bar" aria-hidden="true"/>
            <div className="dk-kcard-body">
                <h3 className="dk-kcard-title">{task.title}</h3>
                <div className="dk-kcard-chips">
                    {task.recipientRole && (
                        <span className="dk-kcard-chip">
              {task.recipientRole.replaceAll('_', ' ')}
            </span>
                    )}
                    {task.dateSent && (
                        <time className="dk-kcard-date" dateTime={task.dateSent}>
                            Sent {task.dateSent}
                        </time>
                    )}
                    {task.dateCompleted && (
                        <time className="dk-kcard-date" dateTime={task.dateCompleted}>
                            Done {task.dateCompleted}
                        </time>
                    )}
                </div>
            </div>

            <div className="dk-kcard-foot">
                {done ? (
                    <>
                        <div className="dk-kcard-done-badge" aria-live="polite">
                            <IcCheck/> Complete
                        </div>
                        <button
                            className="dk-kcard-undo"
                            onClick={() => onToggle(task)}
                            aria-label={`Mark "${task.title}" incomplete`}
                        >
                            <IcUndo/> Undo
                        </button>
                    </>
                ) : na ? (
                    <span style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--neutral)',
                        padding: '7px 14px',
                        borderRadius: 'var(--r-md)',
                        background: 'var(--neutral-surface)',
                        border: '1px solid var(--neutral-line)',
                    }}>
            Not applicable
          </span>
                ) : (
                    <button
                        className="dk-kcard-cta"
                        onClick={() => onToggle(task)}
                        aria-label={`Mark "${task.title}" complete`}
                    >
                        Mark complete <IcArrowRight/>
                    </button>
                )}
            </div>
        </article>
    );
}

export function PostCloseKanban({tasks, onToggle}: Props) {
    const todo = tasks.filter(t => t.status !== 'complete' && t.status !== 'not_applicable');
    const done = tasks.filter(t => t.status === 'complete');
    const na = tasks.filter(t => t.status === 'not_applicable');

    return (
        <div className="dk-kanban" aria-label="Post-close tasks board">
            {/* To Do column */}
            <div className="dk-kanban-col" role="region" aria-label="To do">
                <header className="dk-kanban-col-head">
                    <span className="dk-kanban-col-title">To do</span>
                    <span className="dk-kanban-count">{todo.length + na.length}</span>
                </header>
                {todo.length === 0 && na.length === 0 ? (
                    <div className="dk-kanban-empty">
                        All tasks complete
                    </div>
                ) : (
                    <>
                        {todo.map(task => (
                            <KanbanCard key={task.id} task={task} onToggle={onToggle}/>
                        ))}
                        {na.map(task => (
                            <KanbanCard key={task.id} task={task} onToggle={onToggle}/>
                        ))}
                    </>
                )}
            </div>

            {/* Done column */}
            <div className="dk-kanban-col" role="region" aria-label="Completed">
                <header className="dk-kanban-col-head dk-kanban-col-head--done">
                    <span className="dk-kanban-col-title">Complete</span>
                    <span className="dk-kanban-count">{done.length}</span>
                </header>
                {done.length === 0 ? (
                    <div className="dk-kanban-empty dk-kanban-empty--done">
                        <IcCheck/> Click cards to mark them done
                    </div>
                ) : (
                    done.map(task => (
                        <KanbanCard key={task.id} task={task} onToggle={onToggle}/>
                    ))
                )}
            </div>
        </div>
    );
}
