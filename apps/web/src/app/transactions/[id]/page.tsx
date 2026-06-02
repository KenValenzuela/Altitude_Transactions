'use client';

import {useParams, useRouter} from 'next/navigation';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {api} from '@/lib/api-client';
import type {Contact, ExtractedField, PostCloseTask, Task, Transaction} from '@/types/domain';
import {AppShell} from '@/components/workflow/AppShell';
import {AuditTimeline} from '@/components/workflow/AuditTimeline';
import {Button} from '@/components/workflow/Button';
import {Card} from '@/components/workflow/Card';
import {ContactMatrix} from '@/components/workflow/ContactMatrix';
import {DeadlineList} from '@/components/workflow/DeadlineList';
import {DocumentRequirementList} from '@/components/workflow/DocumentRequirementList';
import {SourceDocumentList} from '@/components/workflow/DocumentViewer';
import {EmptyState} from '@/components/workflow/EmptyState';
import {ErrorState} from '@/components/workflow/ErrorState';
import {ExtractionReviewTable} from '@/components/workflow/ExtractionReviewTable';
import {getNextTaskStatus} from '@/components/workflow/TaskStatusToggle';
import {LoadingState} from '@/components/workflow/LoadingState';
import {MetricCard} from '@/components/workflow/MetricCard';
import {SectionHeader} from '@/components/workflow/SectionHeader';
import {TaskChecklist} from '@/components/workflow/TaskChecklist';
import {PostCloseKanban} from '@/components/workflow/PostCloseKanban';

/* ── Inline icons ── */
function IcBack() {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 12H5"/>
        <path d="m12 5-7 7 7 7"/>
    </svg>;
}

function IcRisk() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>;
}

function IcTrash() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6"/>
        <path d="M14 11v6"/>
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>;
}

function IcAlertTriangle() {
    return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>;
}

/* ── Helper: find a contact by role ── */
function findContact(contacts: Contact[], roles: string[]): Contact | undefined {
    return contacts.find(c => roles.some(r => c.role.toLowerCase().includes(r)));
}

function updateTaskInTransaction(transaction: Transaction, updatedTask: Task): Transaction {
  return {
    ...transaction,
    tasks: transaction.tasks.map((group) => ({
      ...group,
      items: group.items.map((task) => (task.id === updatedTask.id ? { ...task, ...updatedTask } : task)),
    })),
  };
}

function updateFieldInTransaction(transaction: Transaction, updatedField: ExtractedField): Transaction {
    return {
        ...transaction,
        extractedFields: transaction.extractedFields.map((f) => (f.id === updatedField.id ? updatedField : f)),
    };
}

function updatePostCloseInTransaction(transaction: Transaction, id: string, status: PostCloseTask['status']): Transaction {
    return {
        ...transaction,
        postCloseTasks: transaction.postCloseTasks.map((t) => (t.id === id ? {...t, status} : t)),
    };
}

/* ── Active tabs ── */
const TABS = [
    {id: 'overview', label: 'Overview'},
    {id: 'review', label: 'Review'},
    {id: 'deadlines', label: 'Deadlines'},
    {id: 'tasks', label: 'Tasks'},
    {id: 'contacts', label: 'Contacts'},
    {id: 'documents', label: 'Documents'},
    {id: 'activity', label: 'Activity'},
    {id: 'postclose', label: 'Post-close'},
] as const;

type TabId = typeof TABS[number]['id'];

export default function TransactionPage() {
  const { id } = useParams<{ id: string }>();
    const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

  const loadTransaction = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setTransaction(await api.getTransaction(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load transaction workspace.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadTransaction();
  }, [loadTransaction]);

  const nextAction = useMemo(() => {
    const firstTask = transaction?.tasks.flatMap((group) => group.items).find((task) => task.status !== 'complete' && task.status !== 'not_applicable');
    return firstTask?.title || transaction?.deadlines[0]?.eventName || 'Review transaction activity';
  }, [transaction]);

  async function toggleTask(task: Task) {
    const nextStatus = getNextTaskStatus(task);
    setActionMessage(`Updating ${task.title}…`);
    try {
      const updated = await api.updateTask(task.id, nextStatus);
      setTransaction((current) => (current ? updateTaskInTransaction(current, updated) : current));
      setActionMessage(`${task.title} marked ${updated.status.replaceAll('_', ' ')}.`);
    } catch (err) {
      setActionMessage('');
      setError(err instanceof Error ? err.message : 'Unable to update task.');
    }
  }

    async function togglePostCloseTask(task: PostCloseTask) {
        const next = task.status === 'complete' ? 'not_started' : 'complete';
        // Optimistic update so the UI responds immediately
        setTransaction((current) => (current ? updatePostCloseInTransaction(current, task.id, next) : current));
        try {
            await api.updateTask(task.id, next);
        } catch {
            // Roll back optimistic update on failure
            setTransaction((current) => (current ? updatePostCloseInTransaction(current, task.id, task.status) : current));
        }
    }

    async function handleApproveField(field: ExtractedField) {
        try {
            const updated = await api.approveField(field.id);
            setTransaction((current) => (current ? updateFieldInTransaction(current, updated) : current));
        } catch { /* field card shows its own error state */
        }
    }

    async function handleEditField(field: ExtractedField, value: string) {
        try {
            const updated = await api.editField(field.id, value);
            setTransaction((current) => (current ? updateFieldInTransaction(current, updated) : current));
        } catch { /* field card shows its own error state */
        }
    }

    async function handleMarkFieldNA(field: ExtractedField) {
        try {
            const updated = await api.markFieldNA(field.id);
            setTransaction((current) => (current ? updateFieldInTransaction(current, updated) : current));
        } catch { /* field card shows its own error state */
        }
    }

    async function handleMarkFieldUnavailable(field: ExtractedField) {
        try {
            const updated = await api.markFieldUnavailable(field.id, 'Will provide before closing');
            setTransaction((current) => (current ? updateFieldInTransaction(current, updated) : current));
        } catch { /* field card shows its own error state */
        }
    }

    async function handleDelete() {
        setDeleting(true);
        try {
            await api.deleteTransaction(id);
            router.replace('/transactions');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to delete transaction.');
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    }

    /* ── Derived contact display ── */
    const buyer = transaction ? findContact(transaction.contacts, ['buyer']) : undefined;
    const seller = transaction ? findContact(transaction.contacts, ['seller']) : undefined;

    /* ── Risk badge style ── */
    const riskBadgeClass = transaction?.riskLevel === 'high'
        ? 'dk-badge--risk-high'
        : transaction?.riskLevel === 'medium'
            ? 'dk-badge--risk-medium'
            : 'dk-badge--risk-low';

    /* ── Task counts for tab pill ── */
    const pendingTasks = transaction?.counts?.todo ?? 0;
    const pendingReview = transaction?.extractedFields.filter(f => f.reviewDecision === 'unreviewed').length ?? 0;

  return (
    <AppShell>
      {loading ? <LoadingState label="Loading workspace…" /> : null}
      {error ? <ErrorState message={error} onRetry={loadTransaction} /> : null}
      {!loading && !error && !transaction ? <EmptyState title="Transaction not found" message="No workspace matched this route." /> : null}

        {/* ── Delete confirmation dialog ── */}
        {showDeleteConfirm && (
            <div className="dk-dialog-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
                <div className="dk-dialog">
                    <div className="dk-dialog-icon" aria-hidden="true"><IcAlertTriangle/></div>
                    <h2 id="delete-dialog-title">Delete this transaction?</h2>
                    <p>
                        This will permanently remove the workspace, all extracted fields, tasks, deadlines,
                        contacts, and documents. This cannot be undone.
                    </p>
                    <div className="dk-dialog-actions">
                        <button
                            className="dk-btn dk-secondary"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={deleting}
                            autoFocus
                        >
                            Cancel
                        </button>
                        <button
                            className="dk-btn"
                            style={{background: 'var(--risk)', color: 'white', borderColor: 'var(--risk)'}}
                            onClick={() => void handleDelete()}
                            disabled={deleting}
                            aria-busy={deleting}
                        >
                            {deleting ? 'Deleting…' : 'Delete transaction'}
                        </button>
                    </div>
                </div>
            </div>
        )}

      {!loading && !error && transaction ? (
        <>
            {/* ── Navy deal header band ── */}
            <div className="dk-dealhead dk-bleed-top">
                <div className="top">
                    <button
                        className="dk-backbtn"
                        onClick={() => window.history.back()}
                        aria-label="Back to transactions"
                    >
                        <IcBack/>
                    </button>
                    <div style={{flex: 1, minWidth: 0}}>
                        <div className="dk-eyebrow" style={{color: 'var(--fg3-on-navy)', marginBottom: 3}}>
                            Transaction workspace
                        </div>
                        <div className="addr">
                            {transaction.propertyAddress}
                            {transaction.city ? `, ${transaction.city}` : ''}
                        </div>
                        <div className="meta">
                            {[transaction.city, transaction.state, transaction.zip].filter(Boolean).join(', ')}
                            {' · '}${transaction.money.price.toLocaleString()}
                            {transaction.money.daysToClose >= 0
                                ? ` · Closes in ${transaction.money.daysToClose}d`
                                : ` · Close date passed`}
                        </div>
                        <div className="id" style={{marginTop: 5}}>
                  <span style={{marginRight: 10, display: 'inline-flex', alignItems: 'center', gap: 5}}>
                    <span className={`dk-badge ${riskBadgeClass}`} style={{fontSize: 10.5, padding: '2px 9px'}}>
                      <IcRisk/> {transaction.riskLevel} risk
                    </span>
                  </span>
                            <span style={{fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg3-on-navy)'}}>
                    {transaction.status.replaceAll('_', ' ')}
                  </span>
                        </div>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: 10,
                        flexShrink: 0
                    }}>
                        <div style={{
                            fontSize: 42,
                            fontFamily: 'var(--font-serif)',
                            fontWeight: 600,
                            color: 'var(--brass-400)',
                            lineHeight: 1
                        }}>
                            {transaction.completionPercent}
                            <span style={{fontSize: 18, fontWeight: 400, color: 'var(--fg3-on-navy)'}}>%</span>
                        </div>
                        <button
                            className="dk-backbtn"
                            style={{background: 'rgba(155,59,50,.25)', color: 'var(--risk-surface)'}}
                            onClick={() => setShowDeleteConfirm(true)}
                            aria-label="Delete this transaction"
                            title="Delete transaction"
                        >
                            <IcTrash/>
                        </button>
                    </div>
                </div>

                {/* Parties row */}
                {(buyer || seller) && (
                    <div className="parties">
                        {buyer && (
                            <div className="dk-party">
                                <div className="k">Buyer</div>
                                <div className="v">{buyer.name ?? 'Redacted'}</div>
                            </div>
                        )}
                        {seller && (
                            <div className="dk-party">
                                <div className="k">Seller</div>
                                <div className="v">{seller.name ?? 'Redacted'}</div>
                            </div>
                        )}
                        {transaction.closingDate && (
                            <div className="dk-party">
                                <div className="k">Closing</div>
                                <div className="v">{transaction.closingDate}</div>
                            </div>
                        )}
                        {transaction.money.earnest > 0 && (
                            <div className="dk-party">
                                <div className="k">Earnest money</div>
                                <div className="v">${transaction.money.earnest.toLocaleString()}</div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Workspace tabs ── */}
            <div className="dk-tabs dk-bleed" role="tablist" aria-label="Workspace sections">
                {TABS.map(tab => {
                    const pill = tab.id === 'review' && pendingReview > 0
                        ? pendingReview
                        : tab.id === 'tasks' && pendingTasks > 0
                            ? pendingTasks
                            : null;
                    return (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            aria-controls={`panel-${tab.id}`}
                            className={`dk-tab${activeTab === tab.id ? ' on' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                            {pill ? <span className="pill">{pill}</span> : null}
                        </button>
                    );
                })}
            </div>

            {/* ── Tab panels ── */}

            {/* Overview */}
            {activeTab === 'overview' &&
                <div id="panel-overview" role="tabpanel" aria-label="Overview" style={{paddingTop: 8}}>
                    <section className="metric-grid" aria-label="Transaction summary">
                        <MetricCard label="Purchase price" value={`$${transaction.money.price.toLocaleString()}`}/>
                        <MetricCard label="Earnest money" value={`$${transaction.money.earnest.toLocaleString()}`}/>
                        <MetricCard label="Closing" value={transaction.closingDate || '—'}
                                    detail={`${transaction.money.daysToClose >= 0 ? `${transaction.money.daysToClose}d remaining` : 'Past date'}`}/>
                        <MetricCard label="Completion" value={`${transaction.completionPercent}%`}
                                    detail="Tasks complete"/>
                    </section>

                    <Card className="attention-card">
                        <p className="eyebrow">Recommended next action</p>
                        <h2>{nextAction}</h2>
                        <p>Use the sections below to confirm extracted data, clear generated tasks, and keep contractual
                            deadlines visible.</p>
                        <Button variant="secondary" onClick={() => setActiveTab('tasks')}>
                            Go to tasks
                        </Button>
                    </Card>
                </div>}

            {/* Review */}
            {activeTab === 'review' && <div id="panel-review" role="tabpanel" aria-label="Extracted fields review">
                <SectionHeader
                    eyebrow="Source review"
                    title="Extracted fields"
                    description={`${pendingReview > 0 ? `${pendingReview} field${pendingReview !== 1 ? 's' : ''} pending review. ` : 'All fields reviewed. '}Approve, edit, or mark each value before it becomes part of the transaction record.`}
                />
                <ExtractionReviewTable
                    fields={transaction.extractedFields}
                    onApprove={handleApproveField}
                    onEdit={handleEditField}
                    onMarkNA={handleMarkFieldNA}
                    onMarkUnavailable={handleMarkFieldUnavailable}
                />
            </div>}

            {/* Deadlines */}
            {activeTab === 'deadlines' && <div id="panel-deadlines" role="tabpanel" aria-label="Deadlines">
                <SectionHeader eyebrow="Contract dates" title="Deadlines"
                               description="Generated from source-backed contract fields."/>
                <DeadlineList deadlines={transaction.deadlines.slice(0, 15)}/>
            </div>}

            {/* Tasks */}
            {activeTab === 'tasks' && <div id="panel-tasks" role="tabpanel" aria-label="Tasks">
                <SectionHeader eyebrow="Generated operations" title="Tasks"
                               description="Cycle task status as work progresses."/>
                <div role="status" aria-live="polite" className="sr-status">
                    {actionMessage}
                </div>
                <TaskChecklist groups={transaction.tasks} onToggle={toggleTask}/>
            </div>}

            {/* Contacts */}
            {activeTab === 'contacts' && <div id="panel-contacts" role="tabpanel" aria-label="Contacts">
                <SectionHeader eyebrow="People" title="Contacts"
                               description="Extracted parties and required transaction contacts. Click Edit on any card to update contact details."/>
            <ContactMatrix contacts={transaction.contacts} />
            </div>}

            {/* Documents */}
            {activeTab === 'documents' && <div id="panel-documents" role="tabpanel" aria-label="Documents">
                {transaction.sourceDocuments && transaction.sourceDocuments.length > 0 && (
                    <>
                        <SectionHeader eyebrow="Uploaded files" title="Source documents"
                                       description="PDF contracts and addenda uploaded to this transaction. Click View to open in-app."/>
                        <SourceDocumentList documents={transaction.sourceDocuments}/>
                        <div style={{marginTop: 28}}/>
                    </>
                )}
                <SectionHeader eyebrow="File completeness" title="Document requirements"
                               description="Generated requirements and received status from the transaction checklist."/>
            <DocumentRequirementList documents={transaction.documentRequirements} />
            </div>}

            {/* Activity */}
            {activeTab === 'activity' && <div id="panel-activity" role="tabpanel" aria-label="Activity history">
                <SectionHeader eyebrow="Audit trail" title="Activity history"
                               description="Source, review, and task events recorded by the backend."/>
            <AuditTimeline events={transaction.auditEvents} />
            </div>}

            {/* Post-close — Kanban board */}
            {activeTab === 'postclose' && <div id="panel-postclose" role="tabpanel" aria-label="Post-close follow-up">
                <SectionHeader
                    eyebrow="After closing"
                    title="Post-close follow-up"
                    description={
                        transaction.postCloseTasks && transaction.postCloseTasks.length > 0
                            ? `${transaction.postCloseTasks.filter(t => t.status !== 'complete').length} items pending · Click any card to mark it complete.`
                            : 'Thank-you notes, review requests, and client follow-ups tracked here.'
                    }
                />
                {transaction.postCloseTasks && transaction.postCloseTasks.length > 0 ? (
                    <PostCloseKanban
                        tasks={transaction.postCloseTasks}
                        onToggle={togglePostCloseTask}
                    />
                ) : (
                    <EmptyState
                        title="No post-close tasks yet"
                        message="Post-close follow-up items — thank-you notes, review requests, vendor referrals — will appear here once the transaction is confirmed or tasks are added."
                    />
                )}
            </div>}
        </>
      ) : null}
    </AppShell>
  );
}
