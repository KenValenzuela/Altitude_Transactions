'use client';

import Link from 'next/link';
import {useCallback, useEffect, useState} from 'react';
import {api} from '@/lib/api-client';
import type {TransactionCard as TxnType} from '@/types/domain';
import {AppShell} from '@/components/workflow/AppShell';
import {EmptyState} from '@/components/workflow/EmptyState';
import {ErrorState} from '@/components/workflow/ErrorState';
import {LoadingState} from '@/components/workflow/LoadingState';
import {TransactionCard} from '@/components/workflow/TransactionCard';

function IcUpload() {
    return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>;
}

export default function TransactionsPage() {
    const [cards, setCards] = useState<TxnType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            setCards(await api.listTransactions());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load transactions.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const active = cards.filter(c => c.active || (c.stage !== 'Closed' && c.stage !== 'closed'));
    const closed = cards.filter(c => c.stage === 'Closed' || c.stage === 'closed');

    return (
        <AppShell>
            <div className="dk-pagehead">
                <div>
                    <div className="dk-eyebrow">All transactions</div>
                    <h1 className="dk-h1">Active deals</h1>
                    <p className="dk-sub">
                        {loading ? 'Loading…' : `${cards.length} file${cards.length !== 1 ? 's' : ''} total · ${active.length} active`}
                    </p>
                </div>
                <Link href="/upload" className="dk-btn dk-primary">
                    <IcUpload/> Upload contract
                </Link>
            </div>

            {error && <ErrorState message={error} onRetry={load}/>}
            {loading && <LoadingState label="Loading transactions…"/>}

            {!loading && !error && cards.length === 0 && (
                <EmptyState
                    title="No transactions yet"
                    message="Upload a CTME contract to create your first transaction workspace."
                    actionHref="/upload"
                    actionLabel="Upload contract"
                />
            )}

            {!loading && !error && active.length > 0 && (
                <>
                    <div className="dk-section-title">Active files</div>
                    <div className="card-grid">
                        {active.map(t => <TransactionCard key={t.id} transaction={t}/>)}
                    </div>
                </>
            )}

            {!loading && !error && closed.length > 0 && (
                <>
                    <div className="dk-section-title" style={{marginTop: 32}}>Closed files</div>
                    <div className="card-grid">
                        {closed.map(t => <TransactionCard key={t.id} transaction={t}/>)}
                    </div>
                </>
            )}
        </AppShell>
    );
}
