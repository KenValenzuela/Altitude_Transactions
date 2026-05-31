'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api-client';
import type { TransactionCard as TxnType } from '@/types/domain';
import { AppShell } from '@/components/workflow/AppShell';
import { EmptyState } from '@/components/workflow/EmptyState';
import { ErrorState } from '@/components/workflow/ErrorState';
import { LoadingState } from '@/components/workflow/LoadingState';

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
      <div className="dk-deal" style={border ? { borderTop: '1px solid var(--line)', gridTemplateColumns: '44px 1fr 180px auto', gap: 16 } : { gridTemplateColumns: '44px 1fr 180px auto', gap: 16 }}>
        <div className="dk-deal-thumb"><IcHouse /></div>
        <div style={{ minWidth: 0 }}>
          <div className="dk-deal-addr">{t.address}</div>
          <div className="dk-deal-sub">{t.city} · {t.stage} · ${t.price.toLocaleString()}</div>
          <div className="dk-deal-id">{t.id}</div>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, color: 'var(--fg3)', marginBottom: 5 }}>{pct}% complete</div>
          <div style={{ height: 5, background: 'var(--paper-200)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: edgeColor, borderRadius: 99 }} />
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

/* ── Mock static data for deadline + activity sidebar ──────────── */
const MOCK_DEADLINES = [
  { day: '02', mon: 'Jun', title: 'Inspection objection deadline', sub: '412 Aspen Ridge Rd · buyer must respond', tone: 'risk', right: '2 days' },
  { day: '04', mon: 'Jun', title: 'Final walkthrough', sub: '27 Pinecrest Ct · schedule with client', tone: 'ok', right: '4 days' },
  { day: '09', mon: 'Jun', title: 'Appraisal deadline', sub: '88 Lakeview Dr · awaiting lender', tone: 'warn', right: '9 days' },
  { day: '18', mon: 'Jun', title: 'Loan objection deadline', sub: '88 Lakeview Dr · financing contingency', tone: 'warn', right: '18 days' },
  { day: '30', mon: 'Jun', title: 'Closing — 412 Aspen Ridge', sub: 'Time is of the essence', tone: 'neutral', right: '30 days' },
];

const MOCK_ACTIVITY = [
  { t: '2026-05-30 09:14', actor: 'Sarah Chen', action: 'VERIFY', target: 'closing_date → Jun 30, 2026', tone: 'ok' },
  { t: '2026-05-30 09:12', actor: 'Sarah Chen', action: 'APPROVE', target: 'purchase_price → $612,000', tone: 'ok' },
  { t: '2026-05-30 08:55', actor: 'System', action: 'EXTRACT', target: '12 fields from Purchase Contract.pdf', tone: 'info' },
  { t: '2026-05-29 16:40', actor: 'System', action: 'UPLOAD', target: 'Purchase Contract.pdf · 14 pages', tone: 'info' },
  { t: '2026-05-29 16:38', actor: 'Sarah Chen', action: 'CREATE', target: 'transaction ALT-2026-0417', tone: 'neutral' },
];

function dlToneColor(tone: string) {
  return { risk: 'var(--risk)', ok: 'var(--ok)', warn: 'var(--warn)', neutral: 'var(--fg3)' }[tone] ?? 'var(--fg3)';
}
function dlToneFg(tone: string) {
  return { risk: 'var(--risk-text)', ok: 'var(--ok-text)', warn: 'var(--warn-text)', neutral: 'var(--fg3)' }[tone] ?? 'var(--fg3)';
}
function actToneColor(tone: string) {
  return { ok: 'var(--ok)', info: 'var(--info)', warn: 'var(--warn)', neutral: 'var(--fg3)' }[tone] ?? 'var(--fg3)';
}
function actToneFg(tone: string) {
  return { ok: 'var(--ok-text)', info: 'var(--info-text)', warn: 'var(--warn-text)', neutral: 'var(--fg3)' }[tone] ?? 'var(--fg3)';
}

export default function DashboardPage() {
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

  useEffect(() => { void load(); }, [load]);

  const summary = useMemo(() => ({
    activeFiles:  cards.filter(c => c.active).length || cards.length,
    atRisk:       cards.filter(c => c.urgent).length,
    needsReview:  cards.filter(c => (c.stage ?? '').toLowerCase().includes('review')).length,
    averagePct:   cards.length ? Math.round(cards.reduce((s, c) => s + c.progress, 0) / cards.length * 100) : 0,
  }), [cards]);

  const urgent = cards.filter(c => c.urgent);
  const active = cards.filter(c => c.active || c.stage !== 'Closed');

  const stats = [
    { n: summary.atRisk || 3,       l: 'Deadlines this week', k: summary.atRisk > 0 ? `${summary.atRisk} at risk` : '1 at risk',      tone: 'risk', edge: 'var(--risk)' },
    { n: summary.needsReview || 5,  l: 'Fields need review',  k: 'Human review required',  tone: 'warn', edge: 'var(--warn)' },
    { n: 2,                          l: 'Tasks blocked',        k: 'Awaiting third parties', tone: 'warn', edge: 'var(--warn)' },
    { n: summary.activeFiles || 12, l: 'Active files',         k: 'On track',               tone: 'ok',   edge: 'var(--brass-500)' },
  ] as const;

  const nValueColor = { risk: 'var(--risk-text)', warn: 'var(--warn-text)', ok: 'var(--fg1)', neutral: 'var(--fg1)' } as const;

  return (
    <AppShell>
      {/* ── Page head ── */}
      <div className="dk-pagehead">
        <div>
          <div className="dk-eyebrow">{getDayLabel()}</div>
          <h1 className="dk-h1">{getGreeting()}, Sarah</h1>
          <p className="dk-sub">
            You have {summary.atRisk || 3} deadlines this week and {summary.needsReview || 5} fields waiting on your review.
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

      {!loading && !error && (
        <>
          {/* ── Stat row ── */}
          <div className="dk-statrow">
            {stats.map((s, i) => (
              <div className="dk-statcard" key={i}>
                <div className="edge" style={{ background: s.edge }} />
                <div className="n" style={{ color: nValueColor[s.tone] }}>{s.n}</div>
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

                {/* Human review attention item */}
                <Link href="/transactions/demo/review" style={{ textDecoration: 'none', display: 'block' }}>
                  <div className="dk-attn">
                    <div className="dk-attn-edge" style={{ background: 'var(--warn)' }} />
                    <div style={{ flex: 1 }}>
                      <Chip label="Human Review Required" tone="warn" />
                      <div className="dk-attn-title">5 extracted fields need review</div>
                      <div className="dk-attn-sub">1530 Belford Ave · contract just processed. Verify the AI&apos;s findings before approving.</div>
                      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                        <span className="dk-btn sm dk-primary" style={{ cursor: 'pointer' }}>
                          <IcListChecks /> Review fields
                        </span>
                        <span className="dk-btn sm dk-secondary" style={{ cursor: 'pointer' }}>
                          Open file
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Deadline risk attention item */}
                <Link href="/transactions/demo/deadlines" style={{ textDecoration: 'none', display: 'block' }}>
                  <div className="dk-attn">
                    <div className="dk-attn-edge" style={{ background: 'var(--risk)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip label="Deadline Risk" tone="risk" />
                        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12.5, color: 'var(--risk-text)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <IcClock color="var(--risk)" /> 2 days
                        </span>
                      </div>
                      <div className="dk-attn-title">Inspection objection deadline</div>
                      <div className="dk-attn-sub">412 Aspen Ridge Rd · 1 task still open. The buyer must respond by Jun 2.</div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Active files card */}
              <div className="dk-card">
                <div className="dk-card-head">
                  <h3>Active files</h3>
                  <Link href="/transactions" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12.5, color: 'var(--fg-brass)' }}>
                    View all {summary.activeFiles || 12}
                  </Link>
                </div>
                {(active.length > 0 ? active : cards).slice(0, 5).map((t, i) => (
                  <DealRow key={t.id} t={t} border={i > 0} />
                ))}
                {cards.length === 0 && (
                  /* Fallback demo rows when API is empty */
                  [
                    { id: 'ALT-2026-0417', address: '412 Aspen Ridge Rd', city: 'Boulder, CO', stage: 'Under Contract', price: 612000, progress: 0.62, urgent: true, active: true, next: 'Inspection objection · 2d', parties: 'Marcus & Lena Whitford', status: 'active' as const, daysToClose: 30 },
                    { id: 'ALT-2026-0392', address: '88 Lakeview Dr', city: 'Fort Collins, CO', stage: 'Under Contract', price: 489000, progress: 0.80, urgent: false, active: true, next: 'Appraisal due · 9d', parties: 'Diane Okafor', status: 'active' as const, daysToClose: 18 },
                    { id: 'ALT-2026-0405', address: '27 Pinecrest Ct', city: 'Denver, CO', stage: 'Clear to Close', price: 755000, progress: 0.94, urgent: false, active: true, next: 'Final walkthrough · 4d', parties: 'The Halvorsen Trust', status: 'closing' as const, daysToClose: 4 },
                  ].map((t, i) => <DealRow key={t.id} t={t} border={i > 0} />)
                )}
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Upcoming deadlines */}
              <div className="dk-card">
                <div className="dk-card-head">
                  <h3>Upcoming deadlines</h3>
                  <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12.5, color: 'var(--fg-brass)', cursor: 'pointer' }}>Timeline</span>
                </div>
                {MOCK_DEADLINES.map((d, i) => (
                  <div className="dk-dl" key={i}>
                    <div className="dk-dl-date"><b>{d.day}</b>{d.mon}</div>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: dlToneColor(d.tone), flexShrink: 0 }} />
                    <div className="dk-dl-body">
                      <div className="dk-dl-title">{d.title}</div>
                      <div className="dk-dl-sub">{d.sub}</div>
                    </div>
                    <span className="dk-dl-right" style={{ color: dlToneFg(d.tone) }}>
                      {d.tone === 'risk' ? <IcAlert color={dlToneColor(d.tone)} /> : d.tone === 'ok' ? <IcCheck color={dlToneColor(d.tone)} /> : <IcClock color={dlToneColor(d.tone)} />}
                      {d.right}
                    </span>
                  </div>
                ))}
              </div>

              {/* Recent activity */}
              <div className="dk-card">
                <div className="dk-card-head">
                  <h3>Recent activity</h3>
                  <Link href="/audit" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12.5, color: 'var(--fg-brass)' }}>Audit log</Link>
                </div>
                {MOCK_ACTIVITY.map((a, i) => (
                  <div className="dk-audit" key={i}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: actToneColor(a.tone), flexShrink: 0, marginTop: 5 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <span className="dk-audit-act" style={{ color: actToneFg(a.tone) }}>{a.action}</span>
                        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, color: 'var(--fg1)' }}>{a.actor}</span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--fg2)', marginTop: 2 }}>{a.target}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg3)', marginTop: 2 }}>{a.t} MDT</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Compliance note */}
              <div style={{
                background: 'var(--ok-surface)',
                border: '1px solid var(--ok-line)',
                borderRadius: 'var(--r-md)',
                padding: '13px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}>
                <IcShield />
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg1)', lineHeight: 1.5 }}>
                  Tamper-evident audit trail — every action is timestamped and attributed. AI output is held for human review before any value is treated as final.
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
