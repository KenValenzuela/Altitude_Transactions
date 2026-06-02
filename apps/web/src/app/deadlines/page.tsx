'use client';

import Link from 'next/link';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {api} from '@/lib/api-client';
import type {Deadline, Transaction} from '@/types/domain';
import {AppShell} from '@/components/workflow/AppShell';
import {EmptyState} from '@/components/workflow/EmptyState';
import {ErrorState} from '@/components/workflow/ErrorState';
import {LoadingState} from '@/components/workflow/LoadingState';

function IcClock({color}: { color?: string }) {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color ?? 'currentColor'}
                strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
    </svg>;
}

function IcArrow() {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14"/>
        <path d="m12 5 7 7-7 7"/>
    </svg>;
}

interface DeadlineRow extends Deadline {
    transactionAddress: string;
    transactionId: string;
}

function urgencyTone(dl: DeadlineRow): 'risk' | 'warn' | 'ok' | 'neutral' {
    if (dl.applicability === 'completed') return 'ok';
    if (dl.applicability === 'not_applicable') return 'neutral';
    return dl.isUrgent ? 'risk' : 'warn';
}

const TONE_STYLES = {
    risk: {bg: 'var(--risk-surface)', color: 'var(--risk-text)', border: 'var(--risk-line)', dot: 'var(--risk)'},
    warn: {bg: 'var(--warn-surface)', color: 'var(--warn-text)', border: 'var(--warn-line)', dot: 'var(--warn)'},
    ok: {bg: 'var(--ok-surface)', color: 'var(--ok-text)', border: 'var(--ok-line)', dot: 'var(--ok)'},
    neutral: {
        bg: 'var(--neutral-surface)',
        color: 'var(--neutral)',
        border: 'var(--neutral-line)',
        dot: 'var(--paper-300)'
    },
};

export default function DeadlinesPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'all' | 'urgent' | 'open' | 'done'>('all');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const cards = await api.listTransactions();
            const txns = await Promise.all(cards.map(c => api.getTransaction(c.id)));
            setTransactions(txns);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load deadlines.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const allDeadlines = useMemo((): DeadlineRow[] => {
        const rows: DeadlineRow[] = [];
        for (const t of transactions) {
            for (const d of t.deadlines) {
                rows.push({...d, transactionAddress: t.propertyAddress || t.address, transactionId: t.id});
            }
        }
        return rows.sort((a, b) => {
            const toneOrder = {risk: 0, warn: 1, neutral: 2, ok: 3};
            return toneOrder[urgencyTone(a)] - toneOrder[urgencyTone(b)];
        });
    }, [transactions]);

    const filtered = useMemo(() => {
        if (filter === 'urgent') return allDeadlines.filter(d => d.isUrgent && d.applicability !== 'completed');
        if (filter === 'open') return allDeadlines.filter(d => d.applicability !== 'completed' && d.applicability !== 'not_applicable');
        if (filter === 'done') return allDeadlines.filter(d => d.applicability === 'completed');
        return allDeadlines;
    }, [allDeadlines, filter]);

    const urgentCount = allDeadlines.filter(d => d.isUrgent && d.applicability !== 'completed').length;
    const doneCount = allDeadlines.filter(d => d.applicability === 'completed').length;

    const filterOpts: { key: typeof filter; label: string }[] = [
        {key: 'all', label: `All (${allDeadlines.length})`},
        {key: 'urgent', label: `Urgent (${urgentCount})`},
        {key: 'open', label: 'Open'},
        {key: 'done', label: `Done (${doneCount})`},
    ];

    return (
        <AppShell>
            <div className="dk-pagehead dk-global-head">
                <div>
                    <div className="dk-eyebrow">All transactions</div>
                    <h1 className="dk-h1">Deadlines</h1>
                    <p className="dk-sub">
                        {loading ? 'Loading…' : `${allDeadlines.length} deadlines across ${transactions.length} transaction${transactions.length !== 1 ? 's' : ''}`}
                    </p>
                </div>
                {!loading && !error && urgentCount > 0 && (
                    <span className="dk-badge dk-badge--risk">
            <IcClock color="var(--risk)"/> {urgentCount} urgent
          </span>
                )}
            </div>

            {error && <ErrorState message={error} onRetry={load}/>}
            {loading && <LoadingState label="Loading deadlines…"/>}

            {!loading && !error && allDeadlines.length === 0 && (
                <EmptyState
                    title="No deadlines yet"
                    message="Deadlines are generated when a contract is uploaded and extracted. Upload a CTME contract to get started."
                    actionHref="/upload"
                    actionLabel="Upload contract"
                />
            )}

            {!loading && !error && allDeadlines.length > 0 && (
                <section aria-label="Deadlines timeline" className="dk-global-section">
                    {/* Filter tabs */}
                    <div role="group" aria-label="Filter deadlines"
                         style={{display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap'}}>
                        {filterOpts.map(o => (
                            <button
                                key={o.key}
                                onClick={() => setFilter(o.key)}
                                aria-pressed={filter === o.key}
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontWeight: 600,
                                    fontSize: 12.5,
                                    padding: '6px 14px',
                                    borderRadius: 'var(--r-pill)',
                                    border: `1px solid ${filter === o.key ? 'var(--brass-500)' : 'var(--line-strong)'}`,
                                    background: filter === o.key ? 'var(--accent-soft)' : 'var(--bg-surface)',
                                    color: filter === o.key ? 'var(--fg-brass)' : 'var(--fg2)',
                                    cursor: 'pointer',
                                    transition: 'all var(--t-fast)',
                                }}
                            >
                                {o.label}
                            </button>
                        ))}
                    </div>

                    <div className="dk-table-wrap">
                        <table className="dk-data-table">
                            <caption>
                                {filter !== 'all' ? `${filtered.length} ${filter} deadline${filtered.length !== 1 ? 's' : ''}` : `${filtered.length} deadline${filtered.length !== 1 ? 's' : ''}`}
                            </caption>
                            <thead>
                            <tr>
                                <th scope="col">Event</th>
                                <th scope="col">Due date</th>
                                <th scope="col">Section</th>
                                <th scope="col">Status</th>
                                <th scope="col">Transaction</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{
                                        textAlign: 'center',
                                        padding: '24px 18px',
                                        color: 'var(--fg3)',
                                        fontStyle: 'italic'
                                    }}>
                                        No deadlines match this filter.
                                    </td>
                                </tr>
                            ) : filtered.map(d => {
                                const tone = urgencyTone(d);
                                const s = TONE_STYLES[tone];
                                const dateStr = d.dueDate || d.date || d.dueTime || d.rawValue;
                                const label = d.applicability === 'completed' ? 'Complete' : d.applicability === 'not_applicable' ? 'N/A' : d.isUrgent ? 'Urgent' : 'Open';
                                return (
                                    <tr key={d.id}>
                                        <td style={{fontWeight: 600, display: 'flex', alignItems: 'center', gap: 9}}>
                                            <span style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                background: s.dot,
                                                flexShrink: 0,
                                                display: 'inline-block'
                                            }} aria-hidden="true"/>
                                            {d.eventName || d.event || '—'}
                                        </td>
                                        <td className="mono">{dateStr || '—'}</td>
                                        <td className="muted">{d.sectionReference || d.sourceSection || '—'}</td>
                                        <td>
                        <span style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '3px 9px',
                            borderRadius: 'var(--r-pill)',
                            background: s.bg,
                            color: s.color,
                            border: `1px solid ${s.border}`,
                            whiteSpace: 'nowrap',
                        }}>
                          {label}
                        </span>
                                        </td>
                                        <td className="txn-link">
                                            <Link href={`/transactions/${d.transactionId}`}
                                                  style={{display: 'inline-flex', alignItems: 'center', gap: 5}}>
                                                {d.transactionAddress} <IcArrow/>
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </AppShell>
    );
}
