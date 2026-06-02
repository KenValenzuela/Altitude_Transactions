'use client';

import Link from 'next/link';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {api} from '@/lib/api-client';
import type {DocumentRequirement, Transaction} from '@/types/domain';
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

function IcFolder() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>;
}

interface DocRow extends DocumentRequirement {
    transactionAddress: string;
    transactionId: string;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string; label: string }> = {
    missing: {bg: 'var(--risk-surface)', color: 'var(--risk-text)', border: 'var(--risk-line)', label: 'Missing'},
    received: {bg: 'var(--warn-surface)', color: 'var(--warn-text)', border: 'var(--warn-line)', label: 'Received'},
    reviewed: {bg: 'var(--info-surface)', color: 'var(--info-text)', border: 'var(--info-line)', label: 'Reviewed'},
    approved: {bg: 'var(--ok-surface)', color: 'var(--ok-text)', border: 'var(--ok-line)', label: 'Approved'},
    pending: {bg: 'var(--warn-surface)', color: 'var(--warn-text)', border: 'var(--warn-line)', label: 'Pending'},
    upcoming: {bg: 'var(--neutral-surface)', color: 'var(--neutral)', border: 'var(--neutral-line)', label: 'Upcoming'},
    na: {bg: 'var(--neutral-surface)', color: 'var(--neutral)', border: 'var(--neutral-line)', label: 'N/A'},
};

const STATUS_ORDER = ['missing', 'pending', 'received', 'upcoming', 'reviewed', 'approved', 'na'];

export default function DocumentsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const cards = await api.listTransactions();
            const txns = await Promise.all(cards.map(c => api.getTransaction(c.id)));
            setTransactions(txns);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load documents.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const allDocs = useMemo((): DocRow[] => {
        const rows: DocRow[] = [];
        for (const t of transactions) {
            for (const d of t.documentRequirements) {
                rows.push({...d, transactionAddress: t.propertyAddress || t.address, transactionId: t.id});
            }
        }
        return rows.sort((a, b) => {
            const ai = STATUS_ORDER.indexOf(a.receivedStatus);
            const bi = STATUS_ORDER.indexOf(b.receivedStatus);
            return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        });
    }, [transactions]);

    const filtered = useMemo(() => {
        if (statusFilter === 'all') return allDocs;
        return allDocs.filter(d => d.receivedStatus === statusFilter);
    }, [allDocs, statusFilter]);

    const missingCount = allDocs.filter(d => d.receivedStatus === 'missing' && d.requiredStatus === 'required').length;
    const approvedCount = allDocs.filter(d => d.receivedStatus === 'approved').length;

    const statuses = ['all', ...STATUS_ORDER.filter(s => allDocs.some(d => d.receivedStatus === s))];

    return (
        <AppShell>
            <div className="dk-pagehead dk-global-head">
                <div>
                    <div className="dk-eyebrow">All transactions</div>
                    <h1 className="dk-h1">Documents</h1>
                    <p className="dk-sub">
                        {loading ? 'Loading…' : `${allDocs.length} document requirements across ${transactions.length} transaction${transactions.length !== 1 ? 's' : ''}`}
                    </p>
                </div>
                {!loading && !error && allDocs.length > 0 && (
                    <div style={{display: 'flex', gap: 10}}>
                        {missingCount > 0 &&
                            <span className="dk-badge dk-badge--risk"><IcFolder/> {missingCount} missing</span>}
                        <span className="dk-badge dk-badge--ok"><IcFolder/> {approvedCount} approved</span>
                    </div>
                )}
            </div>

            {error && <ErrorState message={error} onRetry={load}/>}
            {loading && <LoadingState label="Loading documents…"/>}

            {!loading && !error && allDocs.length === 0 && (
                <EmptyState
                    title="No document requirements yet"
                    message="Document requirements are generated when a contract is uploaded. Upload a CTME contract to get started."
                    actionHref="/upload"
                    actionLabel="Upload contract"
                />
            )}

            {!loading && !error && allDocs.length > 0 && (
                <section aria-label="Document requirements" className="dk-global-section">
                    <div role="group" aria-label="Filter by status"
                         style={{display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap'}}>
                        {statuses.map(s => {
                            const label = s === 'all' ? `All (${allDocs.length})` : `${STATUS_STYLES[s]?.label ?? s} (${allDocs.filter(d => d.receivedStatus === s).length})`;
                            return (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    aria-pressed={statusFilter === s}
                                    style={{
                                        fontFamily: 'var(--font-sans)',
                                        fontWeight: 600,
                                        fontSize: 12.5,
                                        padding: '6px 14px',
                                        borderRadius: 'var(--r-pill)',
                                        border: `1px solid ${statusFilter === s ? 'var(--brass-500)' : 'var(--line-strong)'}`,
                                        background: statusFilter === s ? 'var(--accent-soft)' : 'var(--bg-surface)',
                                        color: statusFilter === s ? 'var(--fg-brass)' : 'var(--fg2)',
                                        cursor: 'pointer',
                                        transition: 'all var(--t-fast)',
                                    }}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="dk-table-wrap">
                        <table className="dk-data-table">
                            <caption>
                                {filtered.length} document{filtered.length !== 1 ? 's' : ''}{statusFilter !== 'all' ? ` — ${STATUS_STYLES[statusFilter]?.label ?? statusFilter}` : ''}
                            </caption>
                            <thead>
                            <tr>
                                <th scope="col">Document</th>
                                <th scope="col">Category</th>
                                <th scope="col">Required</th>
                                <th scope="col">Status</th>
                                <th scope="col">Due date</th>
                                <th scope="col">Transaction</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{
                                        textAlign: 'center',
                                        padding: '24px 18px',
                                        color: 'var(--fg3)',
                                        fontStyle: 'italic'
                                    }}>
                                        No documents match this filter.
                                    </td>
                                </tr>
                            ) : filtered.map(d => {
                                const st = STATUS_STYLES[d.receivedStatus] ?? STATUS_STYLES.upcoming;
                                return (
                                    <tr key={d.id}>
                                        <td style={{fontWeight: 600}}>{d.documentName || d.name || '—'}</td>
                                        <td className="muted"
                                            style={{textTransform: 'capitalize'}}>{(d.category || '—').replaceAll('_', ' ')}</td>
                                        <td>
                        <span style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 'var(--r-pill)',
                            background: d.requiredStatus === 'required' ? 'var(--risk-surface)' : d.requiredStatus === 'conditional' ? 'var(--warn-surface)' : 'var(--neutral-surface)',
                            color: d.requiredStatus === 'required' ? 'var(--risk-text)' : d.requiredStatus === 'conditional' ? 'var(--warn-text)' : 'var(--neutral)',
                            border: `1px solid ${d.requiredStatus === 'required' ? 'var(--risk-line)' : d.requiredStatus === 'conditional' ? 'var(--warn-line)' : 'var(--neutral-line)'}`,
                        }}>
                          {d.requiredStatus}
                        </span>
                                        </td>
                                        <td>
                        <span style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '3px 9px',
                            borderRadius: 'var(--r-pill)',
                            background: st.bg,
                            color: st.color,
                            border: `1px solid ${st.border}`,
                            whiteSpace: 'nowrap',
                        }}>
                          {st.label}
                        </span>
                                        </td>
                                        <td className="mono">{d.dueDate || '—'}</td>
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
