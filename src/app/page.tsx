'use client';
import { useState, useEffect, useCallback } from 'react';
import type { ScreenId, TweakValues, GoFn } from '@/types';
import { Monogram } from '@/components/brand/Monogram';
import { Wordmark } from '@/components/brand/Wordmark';
import { Button } from '@/components/ui/Button';
import { PhoneShell } from '@/components/ui/PhoneShell';
import { ScreenLogin } from '@/components/screens/ScreenLogin';
import { ScreenDashboard } from '@/components/screens/ScreenDashboard';
import { ScreenUpload } from '@/components/screens/ScreenUpload';
import { ScreenExtracting } from '@/components/screens/ScreenExtracting';
import { ScreenReview } from '@/components/screens/ScreenReview';
import { ScreenOverview } from '@/components/screens/ScreenOverview';
import { ScreenChecklist } from '@/components/screens/ScreenChecklist';
import { ScreenDeadlines } from '@/components/screens/ScreenDeadlines';
import { ScreenParties } from '@/components/screens/ScreenParties';
import { ScreenDocuments } from '@/components/screens/ScreenDocuments';
import { ScreenSummary } from '@/components/screens/ScreenSummary';
import { ScreenPostClose } from '@/components/screens/ScreenPostClose';
import {
  TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakToggle, TweakSelect,
} from '@/components/tweaks/TweaksPanel';

type ConcreteScreenId = Exclude<ScreenId, 'next' | 'prev'>;

const SCREENS: { id: ConcreteScreenId; label: string }[] = [
  { id: 'login',      label: '01 Login' },
  { id: 'dashboard',  label: '02 Dashboard' },
  { id: 'upload',     label: '03 Upload' },
  { id: 'extracting', label: '04 AI Extract' },
  { id: 'review',     label: '05 Review' },
  { id: 'overview',   label: '06 Transaction' },
  { id: 'checklist',  label: '07 Checklist' },
  { id: 'deadlines',  label: '08 Deadlines' },
  { id: 'parties',    label: '09 Parties' },
  { id: 'documents',  label: '10 Documents' },
  { id: 'summary',    label: '11 Summary' },
  { id: 'postclose',  label: '12 Post-close' },
];

const SCREEN_DESCRIPTIONS: Record<ConcreteScreenId, { title: string; body: string; notes?: string[] }> = {
  login:      { title: 'A quiet entry.', body: 'No demo of credentials. Face ID, CREC license tied to the account, one tap into the day.', notes: ['Only licensed CO brokers sign in here.', 'CTME stays the contract system of record.'] },
  dashboard:  { title: 'Today, at a glance.', body: 'Every active transaction. The single most urgent thing surfaces in dark — a "next up" countdown that earns its weight.', notes: ['Tap Pine Ridge to walk the demo flow.', 'AI nudge is a draft, never an action.'] },
  upload:     { title: 'Hand us the PDF.', body: "Files, camera, or a CTME share link. We mirror what's signed there — we don't replace it.", notes: ['Step 1 of 5 in onboarding a new deal.', 'AI extraction starts the moment a file lands.'] },
  extracting: { title: 'Reading the contract.', body: 'Live progress. The broker sees the AI working through pages — earnest money, deadlines, conditional clauses.', notes: ['~30 seconds in production.', 'Confidence scores accompany every extracted field.'] },
  review:     { title: 'You confirm everything.', body: 'Six structured fields. Seven dates. Conditional flags for rural / HOA. Tap to confirm, tap to edit.', notes: ['Human-in-the-loop on every value before it builds the checklist.', '93–100% confidence shown per field.'] },
  overview:   { title: 'The transaction, in one breath.', body: 'Property, money, stage rail, what to do today, progress in active items, and four quick gateways into deeper screens.', notes: ['N/A items already removed from the active count.', 'Stage rail mirrors CTME milestones.'] },
  checklist:  { title: 'Four states. Always.', body: 'Not started → In progress → Complete → N/A. Tap the circle to cycle, or tap the row to set explicitly.', notes: ['N/A items hide from summaries.', 'AI flags items that need human judgment.', 'Conditional sections — Rural, HOA — light up based on the contract.'] },
  deadlines:  { title: 'Two ways to see it.', body: 'Timeline for the next two weeks, month grid for context. Priority items pulse and tint clay.', notes: ['Closing countdown sits up top, calm and clear.', 'Tap any deadline to jump to the related checklist item.'] },
  parties:    { title: 'Six humans, one tap away.', body: 'Buyer, seller, both agents, lender, title, inspector. Call / email / text inline. CTME never required for them.', notes: ["Buyers and sellers never log into CTME — that's deliberate.", "Comm log shows what's been said, by whom."] },
  documents:  { title: 'Received, pending, N/A.', body: "Mirrors the file pack. Sewer scope is N/A on a septic property. Full HOA covenants are N/A — only road association applies.", notes: ["Conditional documents auto-mark N/A based on the contract's clauses.", 'Marked-N/A docs drop out of weekly summaries.'] },
  summary:    { title: 'The weekly drop.', body: 'Drafted by AI, reviewed by Brett, sent to clients. Completed items, upcoming deadlines, what to watch.', notes: ["N/A items never appear here.", "Tone is editorial, not corporate — it's a client-facing artefact."] },
  postclose:  { title: 'After the keys.', body: 'A small batch of follow-ups — gift, thank-you cards, review request, referral check-in. Quiet, intentional.', notes: ['Same 4-state system. N/A what you don\'t do.', 'Closeout is part of the product, not an afterthought.'] },
};

const DEFAULTS: TweakValues = {
  theme: 'light', accent: '#1E3A66', density: 'regular',
  view: 'focus', showAIReasoning: true, stage: 'appraisal',
};

function ScreenComponent({ id, go }: { id: ConcreteScreenId; go: GoFn }) {
  const props = { go };
  switch (id) {
    case 'login':      return <ScreenLogin {...props}/>;
    case 'dashboard':  return <ScreenDashboard {...props}/>;
    case 'upload':     return <ScreenUpload {...props}/>;
    case 'extracting': return <ScreenExtracting {...props}/>;
    case 'review':     return <ScreenReview {...props}/>;
    case 'overview':   return <ScreenOverview {...props}/>;
    case 'checklist':  return <ScreenChecklist {...props}/>;
    case 'deadlines':  return <ScreenDeadlines {...props}/>;
    case 'parties':    return <ScreenParties {...props}/>;
    case 'documents':  return <ScreenDocuments {...props}/>;
    case 'summary':    return <ScreenSummary {...props}/>;
    case 'postclose':  return <ScreenPostClose {...props}/>;
  }
}

export default function AltitudePage() {
  const [tweaks, setTweaksState] = useState<TweakValues>(DEFAULTS);
  const [current, setCurrent] = useState<ConcreteScreenId>('login');
  const [tweaksOpen, setTweaksOpen] = useState(false);

  const setTweak = useCallback(<K extends keyof TweakValues>(key: K, val: TweakValues[K]) => {
    setTweaksState(prev => ({ ...prev, [key]: val }));
  }, []);

  const idx = SCREENS.findIndex(s => s.id === current);

  const go = useCallback((id: string) => {
    if (id === 'next') setCurrent(SCREENS[Math.min(SCREENS.length - 1, idx + 1)].id);
    else if (id === 'prev') setCurrent(SCREENS[Math.max(0, idx - 1)].id);
    else setCurrent(id as ConcreteScreenId);
  }, [idx]);

  useEffect(() => {
    document.documentElement.dataset.theme = tweaks.theme;
    document.documentElement.dataset.density = tweaks.density;
    document.documentElement.dataset.accent = tweaks.accent;
  }, [tweaks.theme, tweaks.density, tweaks.accent]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') setCurrent(SCREENS[Math.min(SCREENS.length - 1, idx + 1)].id);
      if (e.key === 'ArrowLeft')  setCurrent(SCREENS[Math.max(0, idx - 1)].id);
      if (e.key === 't' || e.key === 'T') setTweaksOpen(o => !o);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx]);

  const desc = SCREEN_DESCRIPTIONS[current];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bone)', color: 'var(--ink)', display: 'flex', flexDirection: 'column' }}>
      {/* App header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 28px', borderBottom: '1px solid var(--line)',
        background: 'var(--bone)', position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Monogram size={28}/>
          <Wordmark size={26}/>
          <span style={{
            marginLeft: 8, padding: '3px 8px', borderRadius: 999,
            background: 'var(--paper-2)', border: '1px solid var(--line)',
            fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'var(--ink-3)',
          }}>Prototype · v0.4</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="alt-mono" style={{ fontSize: 12, color: 'var(--ink-3)', letterSpacing: '0.08em' }}>
            Contract-to-close · Colorado residential
          </span>
          <button
            type="button"
            onClick={() => setTweaksOpen(o => !o)}
            className="alt-tap"
            style={{
              appearance: 'none', height: 30, padding: '0 12px', borderRadius: 999,
              border: '1px solid var(--line)', background: tweaksOpen ? 'var(--ink)' : 'var(--paper)',
              color: tweaksOpen ? 'var(--paper)' : 'var(--ink-2)',
              fontSize: 12, fontWeight: 500, fontFamily: 'var(--f-sans)',
            }}>
            Tweaks
          </button>
        </div>
      </div>

      {/* Flow strip */}
      <div style={{ padding: '12px 28px', borderBottom: '1px solid var(--line)', background: 'var(--paper)', overflowX: 'auto', whiteSpace: 'nowrap' }} className="alt-scroll">
        <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
          {SCREENS.map((s, i) => {
            const on = s.id === current;
            const past = i < idx;
            return (
              <span key={s.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {i > 0 && <div style={{ width: 14, height: 1, background: past ? 'var(--sage)' : 'var(--line-strong)', flexShrink: 0 }}/>}
                <button type="button" onClick={() => setCurrent(s.id)}
                  className="alt-tap"
                  style={{
                    appearance: 'none', height: 30, padding: '0 12px', borderRadius: 999,
                    background: on ? 'var(--ink)' : past ? 'var(--sage-tint)' : 'transparent',
                    color: on ? 'var(--paper)' : past ? 'var(--sage-deep)' : 'var(--ink-3)',
                    border: `1px solid ${on ? 'var(--ink)' : past ? 'rgba(30,58,102,.25)' : 'var(--line)'}`,
                    fontSize: 11.5, fontWeight: 500,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    letterSpacing: '0.01em', whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
                  {past && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6.2 5 8.5 9.5 3.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {s.label}
                </button>
              </span>
            );
          })}
        </div>
      </div>

      {/* Stage area */}
      {tweaks.view === 'focus' ? (
        <div style={{
          flex: 1, position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px 0 60px', minHeight: 900,
        }}>
          {/* atmospheric bg */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 800px 400px at 30% 40%, rgba(30,58,102,.06), transparent 70%), radial-gradient(ellipse 600px 600px at 75% 70%, rgba(182,139,60,.05), transparent 70%)',
          }}/>

          {/* Left side hint */}
          <div style={{
            position: 'absolute', left: 40, top: '50%', transform: 'translateY(-50%)',
            width: 240,
            display: typeof window !== 'undefined' && window.innerWidth < 1100 ? 'none' : 'block',
          }}>
            <div className="alt-eyebrow" style={{ marginBottom: 6 }}>This screen</div>
            <div className="alt-display" style={{ fontSize: 32, fontStyle: 'italic', lineHeight: 1.05 }}>
              {desc.title}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 12, lineHeight: 1.5 }}>
              {desc.body}
            </div>
            {desc.notes && (
              <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {desc.notes.map((n, i) => (
                  <li key={i} style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.45, display: 'flex', gap: 8 }}>
                    <span style={{ color: 'var(--sage)', flexShrink: 0 }}>—</span>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Phone */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <PhoneShell label={SCREENS[idx].label} dark={current === 'extracting'}>
              <ScreenComponent id={current} go={go}/>
            </PhoneShell>
          </div>

          {/* Right side hint */}
          <div style={{
            position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)',
            width: 240,
            display: typeof window !== 'undefined' && window.innerWidth < 1100 ? 'none' : 'block',
          }}>
            <div className="alt-eyebrow" style={{ marginBottom: 6 }}>Demo step</div>
            <div className="alt-display" style={{ fontSize: 64, fontStyle: 'italic', lineHeight: 0.9 }}>
              {String(idx + 1).padStart(2, '0')}
              <span style={{ fontSize: 22, color: 'var(--ink-3)', fontStyle: 'normal' }}>/{SCREENS.length}</span>
            </div>
            <div style={{ marginTop: 24, padding: 12, borderRadius: 'var(--r-md)', background: 'var(--paper)', border: '1px solid var(--line)' }}>
              <div className="alt-eyebrow" style={{ marginBottom: 6 }}>Walk-through</div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                Tap inside the phone to advance. Or use ← / → keys. Press T to toggle Tweaks.
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 16 }}>
              <Button variant="secondary" size="sm" full onClick={() => go('prev')}>← Previous</Button>
              <Button variant="sage" size="sm" full onClick={() => go('next')}>Next step →</Button>
            </div>
          </div>
        </div>
      ) : (
        /* Filmstrip view */
        <div style={{ flex: 1, overflowX: 'auto', padding: '32px 32px 60px', background: 'var(--bone)' }} className="alt-scroll">
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', minWidth: 'fit-content' }}>
            {SCREENS.map(s => (
              <div key={s.id} style={{ flexShrink: 0 }}>
                <div className="alt-eyebrow" style={{ marginBottom: 12, paddingLeft: 4, color: current === s.id ? 'var(--sage-deep)' : 'var(--ink-3)' }}>
                  {s.label}
                </div>
                <div
                  style={{
                    transform: 'scale(0.85)', transformOrigin: 'top left',
                    outline: current === s.id ? '3px solid var(--sage)' : 'none',
                    outlineOffset: 8, borderRadius: 52, cursor: 'pointer',
                  }}
                  onClick={() => setCurrent(s.id)}>
                  <PhoneShell label={s.label} dark={s.id === 'extracting'}>
                    <ScreenComponent id={s.id} go={(id) => setCurrent(id === 'next' || id === 'prev' ? s.id : id as ConcreteScreenId)}/>
                  </PhoneShell>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tweaks Panel */}
      <TweaksPanel title="Tweaks" open={tweaksOpen} onClose={() => setTweaksOpen(false)}>
        <TweakSection label="Theme"/>
        <TweakRadio label="Mode" value={tweaks.theme}
          options={[{value:'light',label:'Light'},{value:'dark',label:'Dark'}]}
          onChange={v => setTweak('theme', v as TweakValues['theme'])}/>
        <TweakColor label="Accent" value={tweaks.accent}
          options={['#1E3A66','#27518F','#9C7726','#4A586E']}
          onChange={v => setTweak('accent', v)}/>
        <TweakSection label="Layout"/>
        <TweakRadio label="View" value={tweaks.view}
          options={[{value:'focus',label:'Focus'},{value:'film',label:'Filmstrip'}]}
          onChange={v => setTweak('view', v as TweakValues['view'])}/>
        <TweakRadio label="Density" value={tweaks.density}
          options={[{value:'compact',label:'Compact'},{value:'regular',label:'Regular'},{value:'comfy',label:'Comfy'}]}
          onChange={v => setTweak('density', v as TweakValues['density'])}/>
        <TweakSection label="AI behaviour"/>
        <TweakToggle label="Show reasoning" value={tweaks.showAIReasoning}
          onChange={v => setTweak('showAIReasoning', v)}/>
        <TweakSection label="Demo stage"/>
        <TweakSelect label="Transaction" value={tweaks.stage}
          options={[
            { value: 'under-contract', label: 'Under contract (day 3)' },
            { value: 'inspection',     label: 'Inspection (day 10)' },
            { value: 'appraisal',      label: 'Appraisal (day 18)' },
            { value: 'clear-to-close', label: 'Clear to close (day 27)' },
            { value: 'closed',         label: 'Closed' },
          ]}
          onChange={v => setTweak('stage', v)}/>
        <TweakSection label="Jump to"/>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {SCREENS.map(s => (
            <button key={s.id} type="button"
              onClick={() => { setCurrent(s.id); setTweaksOpen(false); }}
              style={{
                appearance: 'none', padding: '6px 8px', borderRadius: 6,
                border: '1px solid rgba(0,0,0,.08)',
                background: current === s.id ? 'rgba(30,58,102,.18)' : 'transparent',
                color: 'inherit', font: 'inherit', fontSize: 10,
                textAlign: 'left', cursor: 'default',
              }}>
              {s.label}
            </button>
          ))}
        </div>
      </TweaksPanel>
    </div>
  );
}
