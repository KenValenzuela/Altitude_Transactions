'use client';

import Link from 'next/link';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {api} from '@/lib/api-client';
import type {ActivityLogItem, Transaction} from '@/types/domain';
import {AppShell} from '@/components/workflow/AppShell';
import {EmptyState} from '@/components/workflow/EmptyState';
import {ErrorState} from '@/components/workflow/ErrorState';
import {LoadingState} from '@/components/workflow/LoadingState';

function IcArrow() {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14"/>
        <path d="m12 5 7 7-7 7"/>
    </svg>;
}

interface AuditRow extends ActivityLogItem {
    transactionAddress: string;
    transactionId: string;
}

function actorIcon(type: string): string {
    if (type === 'ai' || type === 'llm' || type === 'system') return '⬡';
    return '◎';
}

function eventColor(type: string): string {
    if (type.includes('approved') || type.includes('complete') || type.includes('confirm')) return 'var(--ok)';
    if (type.includes('reject') || type.includes('delete') || type.includes('fail')) return 'var(--risk)';
    if (type.includes('edit') || type.includes('update') || type.includes('review')) return 'var(--warn)';
    return 'var(--info)';
}

function formatTs(iso: string): string {
    try {
        const d = new Date(iso);
        return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'});
    } catch {
        return iso;
    }
}

export default function AuditPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actorFilter, setActorFilter] = useState<'all' | 'user' | 'ai'>('all');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const cards = await api.listTransactions();
            const txns = await Promise.all(cards.map(c => api.getTransaction(c.id)));
            setTransactions(txns);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load audit log.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const allEvents = useMemo((): AuditRow[] => {
        const rows: AuditRow[] = [];
        for (const t of transactions) {
            for (const e of t.auditEvents) {
                rows.push({...e, transactionAddress: t.propertyAddress || t.address, transactionId: t.id});
            }
        }
        return rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [transactions]);

    const filtered = useMemo(() => {
        if (actorFilter === 'user') return allEvents.filter(e => e.actorType === 'user');
        if (actorFilter === 'ai') return allEvents.filter(e => e.actorType !== 'user');
        return allEvents;
    }, [allEvents, actorFilter]);

    const userCount = allEvents.filter(e => e.actorType === 'user').length;
    const aiCount = allEvents.filter(e => e.actorType !== 'user').length;

    return (
        <AppShell>
            <div className="dk-pagehead dk-global-head">
                <div>
                    <div className="dk-eyebrow">All transactions</div>
                    <h1 className="dk-h1">Audit log</h1>
                    <p className="dk-sub">
                        {loading ? 'Loading…' : `${allEvents.length} events across ${transactions.length} transaction${transactions.length !== 1 ? 's' : ''} — tamper-evident, chronological`}
                    </p>
                </div>
                {!loading && !error && allEvents.length > 0 && (
                    <div style={{display: 'flex', gap: 10}}>
                        <span className="dk-badge dk-badge--info">{userCount} by user</span>
                        <span className="dk-badge dk-badge--neutral">{aiCount} by AI</span>
                    </div>
                )}
            </div>

            {error && <ErrorState message={error} onRetry={load}/>}
            {loading && <LoadingState label="Loading audit log…"/>}

            {!loading && !error && allEvents.length === 0 && (
                <EmptyState
                    title="No audit events yet"
                    message="Every action in Altitude is recorded here. Upload and process a contract to generate your first audit trail."
                    actionHref="/upload"
                    actionLabel="Upload contract"
                />
            )}

            {!loading && !error && allEvents.length > 0 && (
                <section aria-label="Audit log" className="dk-global-section">
                    <div role="group" aria-label="Filter by actor" style={{display: 'flex', gap: 6, marginBottom: 16}}>
                        {([['all', `All (${allEvents.length})`], ['user', `User (${userCount})`], ['ai', `AI (${aiCount})`]] as const).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setActorFilter(key)}
                                aria-pressed={actorFilter === key}
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontWeight: 600,
                                    fontSize: 12.5,
                                    padding: '6px 14px',
                                    borderRadius: 'var(--r-pill)',
                                    border: `1px solid ${actorFilter === key ? 'var(--brass-500)' : 'var(--line-strong)'}`,
                                    background: actorFilter === key ? 'var(--accent-soft)' : 'var(--bg-surface)',
                                    color: actorFilter === key ? 'var(--fg-brass)' : 'var(--fg2)',
                                    cursor: 'pointer',
                                    transition: 'all var(--t-fast)',
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <ol className="dk-feed-list" aria-label="Audit events, most recent first">
                        {filtered.length === 0 ? (
                            <li className="dk-feed-item" style={{color: 'var(--fg3)', fontStyle: 'italic'}}>
                                No events match this filter.
                            </li>
                        ) : filtered.map(e => {
                            const dotColor = eventColor(e.eventType);
                            const isUser = e.actorType === 'user';
                            return (
                                <li key={e.id} className="dk-feed-item">
                  <span
                      style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: isUser ? 'var(--info-surface)' : 'var(--neutral-surface)',
                          border: `1px solid ${isUser ? 'var(--info-line)' : 'var(--neutral-line)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          color: isUser ? 'var(--info-text)' : 'var(--neutral)',
                          flexShrink: 0,
                          fontFamily: 'var(--font-mono)',
                          marginTop: 1,
                      }}
                      aria-label={isUser ? 'User action' : 'AI action'}
                  >
                    {actorIcon(e.actorType)}
                  </span>
                                    <div style={{flex: 1, minWidth: 0}}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap'}}>
                      <span style={{
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 600,
                          fontSize: 13,
                          color: 'var(--fg1)',
                      }}>
                        {e.eventType.replaceAll('_', ' ')}
                      </span>
                                            <span style={{
                                                fontFamily: 'var(--font-sans)',
                                                fontSize: 11,
                                                fontWeight: 600,
                                                padding: '2px 7px',
                                                borderRadius: 'var(--r-pill)',
                                                background: isUser ? 'var(--info-surface)' : 'var(--neutral-surface)',
                                                color: isUser ? 'var(--info-text)' : 'var(--neutral)',
                                                border: `1px solid ${isUser ? 'var(--info-line)' : 'var(--neutral-line)'}`,
                                            }}>
                        {e.actorType}
                      </span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                            marginTop: 3,
                                            flexWrap: 'wrap'
                                        }}>
                      <span style={{fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg3)'}}>
                        {e.entityType.replaceAll('_', ' ')}
                          {e.entityId ? ` · ${e.entityId.slice(0, 8)}…` : ''}
                      </span>
                                            <span style={{
                                                width: 4,
                                                height: 4,
                                                borderRadius: '50%',
                                                background: dotColor,
                                                display: 'inline-block'
                                            }} aria-hidden="true"/>
                                            <time
                                                dateTime={e.createdAt}
                                                style={{
                                                    fontFamily: 'var(--font-mono)',
                                                    fontSize: 11,
                                                    color: 'var(--fg3)'
                                                }}
                                            >
                                                {formatTs(e.createdAt)}
                                            </time>
                                        </div>
                                        {(e.afterValue || e.beforeValue) && (
                                            <details style={{marginTop: 5}}>
                                                <summary style={{
                                                    fontFamily: 'var(--font-sans)',
                                                    fontSize: 11.5,
                                                    color: 'var(--fg3)',
                                                    cursor: 'pointer',
                                                    userSelect: 'none'
                                                }}>
                                                    Show diff
                                                </summary>
                                                <div style={{
                                                    marginTop: 6,
                                                    fontFamily: 'var(--font-mono)',
                                                    fontSize: 11,
                                                    color: 'var(--fg2)',
                                                    background: 'var(--bg-inset)',
                                                    borderRadius: 'var(--r-sm)',
                                                    padding: '8px 12px',
                                                    maxHeight: 100,
                                                    overflow: 'auto'
                                                }}>
                                                    {e.afterValue ?? e.beforeValue}
                                                </div>
                                            </details>
                                        )}
                                    </div>
                                    <div style={{flexShrink: 0}}>
                                        <Link
                                            href={`/transactions/${e.transactionId}`}
                                            style={{
                                                fontFamily: 'var(--font-sans)',
                                                fontWeight: 600,
                                                fontSize: 11.5,
                                                color: 'var(--fg-brass)',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 4,
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {e.transactionAddress.split(',')[0]} <IcArrow/>
                                        </Link>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </section>
            )}
        </AppShell>
    );
}
