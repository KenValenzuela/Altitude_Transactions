'use client';

import Link from 'next/link';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {api, getStoredUser} from '@/lib/api-client';
import type {TransactionCard as TxnType} from '@/types/domain';
import {AppShell} from '@/components/workflow/AppShell';
import {EmptyState} from '@/components/workflow/EmptyState';
import {ErrorState} from '@/components/workflow/ErrorState';
import {LoadingState} from '@/components/workflow/LoadingState';

/* ── Tiny icon helpers ── */
function IcHouse() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brass-400)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>;
}
function IcClock({ color }: { color?: string }) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color ?? 'currentColor'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function IcAlert({ color }: { color?: string }) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color ?? 'currentColor'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
function IcCheck({ color }: { color?: string }) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color ?? 'currentColor'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>;
}
function IcUpload() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
}
function IcListChecks() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 7 2 2 4-4"/><path d="m3 12 2 2 4-4"/><path d="m3 17 2 2 4-4"/><line x1="13" y1="8" x2="21" y2="8"/><line x1="13" y1="13" x2="21" y2="13"/><line x1="13" y1="18" x2="21" y2="18"/></svg>;
}
function IcShield() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>;
}

function IcActivity() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>;
}

/* ── Derive a short status line for activity feed ── */
function activityLine(t: TxnType): { text: string; tone: string } {
    if (t.urgent) return {text: `Deadline in ${t.daysToClose}d — review now`, tone: 'risk'};
    const s = (t.stage ?? '').toLowerCase();
    if (s.includes('review')) return {text: 'Awaiting human review of extracted fields', tone: 'warn'};
    if (s.includes('closing')) return {text: `Closing in ${t.daysToClose}d`, tone: 'warn'};
    if (s.includes('closed') || s.includes('clear')) return {text: 'File closed', tone: 'ok'};
    if (t.next) return {text: t.next, tone: 'neutral'};
    return {text: 'Active — no upcoming deadline flagged', tone: 'neutral'};
}

/* ── Derived tone from transaction data ── */
function getTone(t: TxnType): 'risk' | 'warn' | 'ok' | 'neutral' {
  if (t.urgent) return 'risk';
  const s = (t.stage ?? '').toLowerCase();
  if (s.includes('review')) return 'warn';
  if (s.includes('closed') || s.includes('clear')) return 'ok';
  return 'neutral';
}

/* ── Status chip ── */
function Chip({ label, tone }: { label: string; tone: string }) {
  const styles: Record<string, React.CSSProperties> = {
    risk:    { background: 'var(--risk-surface)',    color: 'var(--risk-text)',    borderColor: 'var(--risk-line)' },
    warn:    { background: 'var(--warn-surface)',    color: 'var(--warn-text)',    borderColor: 'var(--warn-line)' },
    ok:      { background: 'var(--ok-surface)',      color: 'var(--ok-text)',      borderColor: 'var(--ok-line)' },
    neutral: { background: 'var(--neutral-surface)', color: 'var(--neutral)',      borderColor: 'var(--neutral-line)' },
  };
  return (
    <span className="dk-badge" style={styles[tone] ?? styles.neutral}>{label}</span>
  );
}

/* ── Deal row (compact) ── */
function DealRow({ t, border }: { t: TxnType; border?: boolean }) {
  const tone = getTone(t);
  const edgeColor = { risk: 'var(--risk)', warn: 'var(--warn)', ok: 'var(--brass-500)', neutral: 'var(--paper-300)' }[tone];
  const pct = Math.round(t.progress * 100);
  return (
    <Link href={`/transactions/${t.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div
            className="dk-deal"
            style={border ? {borderTop: '1px solid var(--line)'} : {}}
        >
        <div className="dk-deal-thumb"><IcHouse /></div>
            <div style={{minWidth: 0, flex: 1}}>
          <div className="dk-deal-addr">{t.address}</div>
          <div className="dk-deal-sub">{t.city} · {t.stage} · ${t.price.toLocaleString()}</div>
                {/* Progress inline for mobile — avoids 4-column overflow */}
                <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 5}}>
                    <div style={{
                        flex: 1,
                        maxWidth: 120,
                        height: 4,
                        background: 'var(--paper-200)',
                        borderRadius: 99,
                        overflow: 'hidden'
                    }}>
                        <div style={{height: '100%', width: `${pct}%`, background: edgeColor, borderRadius: 99}}/>
                    </div>
                    <span className="meta">{pct}%</span>
          </div>
        </div>
        <Chip label={t.urgent ? 'Deadline Risk' : t.stage} tone={tone} />
      </div>
    </Link>
  );
}

/* ── Greeting ── */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getDayLabel(): string {
  const d = new Date();
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
  const rest = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return `${weekday} · ${rest}`;
}

function dlToneColor(tone: string) {
  return { risk: 'var(--risk)', ok: 'var(--ok)', warn: 'var(--warn)', neutral: 'var(--fg3)' }[tone] ?? 'var(--fg3)';
}
function dlToneFg(tone: string) {
  return { risk: 'var(--risk-text)', ok: 'var(--ok-text)', warn: 'var(--warn-text)', neutral: 'var(--fg3)' }[tone] ?? 'var(--fg3)';
}

export default function DashboardPage() {
  const [cards, setCards] = useState<TxnType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
    const [brokerName, setBrokerName] = useState('there');
    const [greeting, setGreeting] = useState('Good morning');
    const [dayLabel, setDayLabel] = useState('');

    useEffect(() => {
        const name = getStoredUser()?.name?.split(' ')[0];
        if (name) setBrokerName(name);
        setGreeting(getGreeting());
        setDayLabel(getDayLabel());
    }, []);

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

  useEffect(() => { void load(); }, [load]);

  const summary = useMemo(() => ({
    activeFiles:  cards.filter(c => c.active).length || cards.length,
    atRisk:       cards.filter(c => c.urgent).length,
    needsReview:  cards.filter(c => (c.stage ?? '').toLowerCase().includes('review')).length,
    averagePct:   cards.length ? Math.round(cards.reduce((s, c) => s + c.progress, 0) / cards.length * 100) : 0,
  }), [cards]);

  const urgentCards = cards.filter(c => c.urgent);
  const active = cards.filter(c => c.active || c.stage !== 'Closed');

  /* Derive upcoming deadlines from transaction cards — sorted by days to close */
  const upcomingDeadlines = useMemo(() =>
    [...cards]
      .filter(c => c.daysToClose >= 0 && c.next)
      .sort((a, b) => a.daysToClose - b.daysToClose)
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        address: c.address,
        next: c.next,
        daysToClose: c.daysToClose,
        tone: c.urgent ? 'risk' : c.daysToClose <= 7 ? 'warn' : 'neutral',
      })),
  [cards]);

  const stats = [
    { n: summary.atRisk,      l: 'At-risk deadlines', k: summary.atRisk > 0 ? `${summary.atRisk} need attention` : 'None flagged',    tone: summary.atRisk > 0 ? 'risk' : 'ok', edge: summary.atRisk > 0 ? 'var(--risk)' : 'var(--ok)' },
    { n: summary.needsReview, l: 'In review',          k: 'Human review required', tone: summary.needsReview > 0 ? 'warn' : 'ok', edge: summary.needsReview > 0 ? 'var(--warn)' : 'var(--ok)' },
    { n: summary.activeFiles, l: 'Active files',       k: 'Under contract',        tone: 'ok',   edge: 'var(--brass-500)' },
    { n: summary.averagePct,  l: 'Avg. completion',    k: 'Across active files',   tone: 'neutral', edge: 'var(--paper-300)' },
  ] as const;

  const nValueColor = { risk: 'var(--risk-text)', warn: 'var(--warn-text)', ok: 'var(--fg1)', neutral: 'var(--fg1)' } as const;

  return (
    <AppShell>
      {/* ── Page head ── */}
      <div className="dk-pagehead">
        <div>
            <div className="dk-eyebrow">{dayLabel}</div>
            <h1 className="dk-h1">{greeting}, {brokerName}</h1>
          <p className="dk-sub">
            {summary.atRisk > 0
              ? `${summary.atRisk} file${summary.atRisk !== 1 ? 's' : ''} have deadline risk. Review before they become critical.`
              : summary.activeFiles > 0
              ? `${summary.activeFiles} active file${summary.activeFiles !== 1 ? 's' : ''}. All deadlines on track.`
              : 'No active transactions. Upload a contract to get started.'}
          </p>
        </div>
        <Link href="/upload" className="dk-btn dk-primary">
          <IcUpload /> Upload contract
        </Link>
      </div>

      {/* ── Loading / error states ── */}
      {error && <ErrorState message={error} onRetry={load} />}
      {loading && <LoadingState label="Loading transactions…" />}

      {!loading && !error && cards.length === 0 && (
        <EmptyState
          title="No transactions yet"
          message="Upload a CTME contract to create the first transaction workspace."
          actionHref="/upload"
          actionLabel="Upload contract"
        />
      )}

      {!loading && !error && cards.length > 0 && (
        <>
          {/* ── Stat row ── */}
          <div className="dk-statrow">
            {stats.map((s, i) => (
              <div className="dk-statcard" key={i}>
                <div className="edge" style={{ background: s.edge }} />
                <div className="n" style={{ color: nValueColor[s.tone] }}>
                  {s.l === 'Avg. completion' ? `${s.n}%` : s.n}
                </div>
                <div className="l">{s.l}</div>
                <div className="k" style={{ color: dlToneFg(s.tone) }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.edge, display: 'inline-block', flexShrink: 0 }} />
                  {s.k}
                </div>
              </div>
            ))}
          </div>

          {/* ── Two-column layout ── */}
          <div className="dk-cols">
            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Attention card */}
              <div className="dk-card">
                <div className="dk-card-head">
                  <h3>Needs your attention</h3>
                  <Link href="/transactions" className="dk-card-head a" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12.5, color: 'var(--fg-brass)', cursor: 'pointer' }}>All deals</Link>
                </div>

                {urgentCards.length > 0 ? urgentCards.slice(0, 2).map((t) => (
                  <Link key={t.id} href={`/transactions/${t.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div className="dk-attn">
                      <div className="dk-attn-edge" style={{ background: 'var(--risk)' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip label="Deadline Risk" tone="risk" />
                          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12.5, color: 'var(--risk-text)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <IcClock color="var(--risk)" /> {t.daysToClose}d
                          </span>
                        </div>
                        <div className="dk-attn-title">{t.next}</div>
                        <div className="dk-attn-sub">{t.address} · {t.city}</div>
                      </div>
                    </div>
                  </Link>
                )) : summary.needsReview > 0 ? (
                  <Link href="/transactions" style={{ textDecoration: 'none', display: 'block' }}>
                    <div className="dk-attn">
                      <div className="dk-attn-edge" style={{ background: 'var(--warn)' }} />
                      <div style={{ flex: 1 }}>
                        <Chip label="Human Review Required" tone="warn" />
                        <div className="dk-attn-title">{summary.needsReview} file{summary.needsReview !== 1 ? 's' : ''} awaiting review</div>
                        <div className="dk-attn-sub">Open a transaction and verify extracted fields before approving.</div>
                        <div style={{ marginTop: 12 }}>
                          <span className="dk-btn sm dk-primary" style={{ cursor: 'pointer' }}>
                            <IcListChecks /> View transactions
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div style={{ padding: '16px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <IcShield />
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--fg2)' }}>All files on track — no urgent items.</span>
                  </div>
                )}
              </div>

              {/* Active files card */}
              <div className="dk-card">
                <div className="dk-card-head">
                  <h3>Active files</h3>
                  <Link href="/transactions" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12.5, color: 'var(--fg-brass)' }}>
                    View all {summary.activeFiles}
                  </Link>
                </div>
                {(active.length > 0 ? active : cards).slice(0, 5).map((t, i) => (
                  <DealRow key={t.id} t={t} border={i > 0} />
                ))}
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Upcoming deadlines — derived from transaction cards */}
              <div className="dk-card">
                <div className="dk-card-head">
                  <h3>Upcoming deadlines</h3>
                </div>
                {upcomingDeadlines.length > 0 ? upcomingDeadlines.map((d, i) => (
                  <Link key={d.id} href={`/transactions/${d.id}/deadlines`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div className="dk-dl" style={i > 0 ? { borderTop: '1px solid var(--line)' } : {}}>
                      <div className="dk-dl-date">
                        <b>{d.daysToClose}</b>
                        <span style={{ fontSize: 10 }}>days</span>
                      </div>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: dlToneColor(d.tone), flexShrink: 0 }} />
                      <div className="dk-dl-body">
                        <div className="dk-dl-title">{d.next}</div>
                        <div className="dk-dl-sub">{d.address}</div>
                      </div>
                      <span className="dk-dl-right" style={{ color: dlToneFg(d.tone) }}>
                        {d.tone === 'risk' ? <IcAlert color={dlToneColor(d.tone)} /> : d.tone === 'ok' ? <IcCheck color={dlToneColor(d.tone)} /> : <IcClock color={dlToneColor(d.tone)} />}
                        {d.daysToClose}d
                      </span>
                    </div>
                  </Link>
                )) : (
                  <div style={{ padding: '12px 0', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg3)' }}>
                    No upcoming deadlines. Open a transaction to view its full deadline timeline.
                  </div>
                )}
              </div>

                {/* Recent file status ── derived from live card data */}
              <div className="dk-card">
                <div className="dk-card-head">
                    <h3>Recent files</h3>
                    <Link href="/transactions" style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 600,
                        fontSize: 12.5,
                        color: 'var(--fg-brass)'
                    }}>
                        All files
                    </Link>
                </div>
                  {cards.slice(0, 5).map((t, i) => {
                      const {text, tone} = activityLine(t);
                      const dotColor = {
                          risk: 'var(--risk)',
                          warn: 'var(--warn)',
                          ok: 'var(--ok)',
                          neutral: 'var(--paper-300)'
                      }[tone];
                      const textColor = {
                          risk: 'var(--risk-text)',
                          warn: 'var(--warn-text)',
                          ok: 'var(--ok-text)',
                          neutral: 'var(--fg3)'
                      }[tone];
                      return (
                          <Link key={t.id} href={`/transactions/${t.id}`}
                                style={{textDecoration: 'none', display: 'block'}}>
                              <div className="dk-audit" style={i > 0 ? {} : {borderTop: 'none'}}>
                        <span
                            className="dk-audit-act"
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: dotColor,
                                flexShrink: 0,
                                marginTop: 6,
                                display: 'inline-block'
                            }}
                            aria-hidden="true"
                        />
                                  <div style={{flex: 1, minWidth: 0}}>
                                      <div style={{
                                          fontFamily: 'var(--font-sans)',
                                          fontWeight: 600,
                                          fontSize: 13,
                                          color: 'var(--fg1)',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap'
                                      }}>
                                          {t.address}
                                      </div>
                                      <div style={{
                                          fontFamily: 'var(--font-sans)',
                                          fontSize: 12,
                                          color: textColor,
                                          marginTop: 1
                                      }}>
                                          <IcActivity/> {text}
                                      </div>
                                      <div style={{
                                          fontFamily: 'var(--font-mono)',
                                          fontSize: 10.5,
                                          color: 'var(--fg3)',
                                          marginTop: 2
                                      }}>
                                          {t.city} · {Math.round(t.progress * 100)}% complete
                                      </div>
                                  </div>
                              </div>
                          </Link>
                      );
                  })}
                  {cards.length === 0 && (
                      <div style={{
                          padding: '12px 18px',
                          fontFamily: 'var(--font-sans)',
                          fontSize: 13,
                          color: 'var(--fg3)'
                      }}>
                          No active files. Upload a contract to get started.
                      </div>
                  )}
              </div>

              {/* Compliance note */}
                <div className="dk-notice dk-notice--ok">
                <IcShield />
                    <span>Tamper-evident audit trail — every action is timestamped and attributed. AI output is held for human review before any value is treated as final.</span>
              </div>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
