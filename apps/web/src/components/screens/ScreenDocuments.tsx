'use client';
import { useEffect, useState } from 'react';
import type { GoFn } from '@/types';
import type {ApiDocumentState} from '@/types/api';
import type {DocumentRequirement as ApiDocument} from '@/types/domain';
import { FIXTURE_DETAIL } from '@/lib/fixtures';
import { Icon } from '@/components/ui/icons';
import { IconButton } from '@/components/ui/IconButton';
import { TopBar } from '@/components/ui/TopBar';

type DocFilter = 'all' | 'received' | 'pending' | 'na';

const DOC_CYCLE: Record<ApiDocumentState, ApiDocumentState> = {
  received: 'pending',
  pending: 'upcoming',
  upcoming: 'na',
  na: 'received',
    reviewed: 'approved',
    approved: 'received',
    missing: 'pending',
};

function DocRow({ doc, onCycle }: { doc: ApiDocument; onCycle: (d: ApiDocument) => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px', borderBottom: '0.5px solid var(--line)',
      opacity: doc.state === 'na' ? 0.55 : 1,
    }}>
      <div style={{
        width: 32, height: 38, borderRadius: 4,
        background: doc.state === 'received' ? 'var(--sage-tint)' : doc.state === 'pending' ? 'var(--gold-soft)' : doc.state === 'na' ? 'var(--na-soft)' : 'var(--paper-2)',
        border: '1px solid var(--line)', flexShrink: 0, position: 'relative',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 4,
      }}>
        <svg width="18" height="18" viewBox="0 0 18 18" style={{ position: 'absolute', top: 4, left: 7 }}>
          <path d="M3 1 H10 L14 5 V16 H3 Z"
            stroke={doc.state === 'received' ? 'var(--sage-deep)' : doc.state === 'pending' ? 'var(--gold)' : 'var(--ink-3)'}
            strokeWidth="1" fill="none"/>
          <path d="M10 1 V5 H14" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.4"/>
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 500,
          textDecoration: doc.state === 'na' ? 'line-through' : 'none',
          textDecorationColor: 'rgba(0,0,0,.25)',
        }}>{doc.name ?? doc.documentName}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
            {doc.notes || doc.purpose}
        </div>
      </div>
      <button type="button" className="alt-tap" onClick={() => onCycle(doc)}
        style={{ appearance: 'none', border: 0, background: 'transparent', padding: 0, cursor: 'pointer' }}
              aria-label={`Cycle status for ${doc.name ?? doc.documentName}`}>
        {doc.state === 'received' && <span style={{ color: 'var(--sage)' }}>{Icon.check()}</span>}
        {doc.state === 'pending' && (
          <span className="alt-pill" style={{ background: 'var(--gold-soft)', color: 'var(--gold)' }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--gold)', display: 'inline-block' }}/>
            Pending
          </span>
        )}
        {doc.state === 'upcoming' && (
          <span className="alt-pill" style={{ background: 'var(--slate-soft)', color: 'var(--slate)' }}>Upcoming</span>
        )}
        {doc.state === 'na' && (
          <span className="alt-pill" style={{ background: 'var(--na-soft)', color: 'var(--na)' }}>N/A</span>
        )}
      </button>
    </div>
  );
}

interface ScreenDocumentsProps {
  go: GoFn;
  documents?: ApiDocument[];
  /** Persist a document state change. Defaults to local-only (walkthrough). */
  onSetState?: (docId: string, state: ApiDocumentState) => void | Promise<void>;
  title?: string;
}

export function ScreenDocuments({
  go,
                                    documents = FIXTURE_DETAIL.documents ?? [],
  onSetState,
  title = 'Documents',
}: ScreenDocumentsProps) {
  const [docs, setDocs] = useState<ApiDocument[]>(documents);
  const [filter, setFilter] = useState<DocFilter>('all');

  useEffect(() => { setDocs(documents); }, [documents]);

  const cycle = (doc: ApiDocument) => {
      const currentState = (doc.state ?? 'pending') as ApiDocumentState;
      const next = DOC_CYCLE[currentState] ?? 'pending';
    setDocs((prev) => prev.map((d) => (d.id === doc.id ? { ...d, state: next } : d)));
    void onSetState?.(doc.id, next);
  };

  const groups = {
    received: docs.filter((x) => x.state === 'received'),
    pending: docs.filter((x) => x.state === 'pending'),
    upcoming: docs.filter((x) => x.state === 'upcoming'),
    na: docs.filter((x) => x.state === 'na'),
  };

  return (
    <>
      <TopBar
        eyebrow={title}
        title="Documents"
        leading={<IconButton icon={Icon.back()} onClick={() => go('overview')} label="Back"/>}
        trailing={<IconButton icon={Icon.upload()} label="Upload"/>}
      />

      <div style={{ padding: '0 20px 12px', display: 'flex', gap: 8 }}>
        {([
          { id: 'all',      l: 'All',      n: docs.filter((x) => x.state !== 'na').length },
          { id: 'received', l: 'Received', n: groups.received.length },
          { id: 'pending',  l: 'Pending',  n: groups.pending.length },
          { id: 'na',       l: 'N/A',      n: groups.na.length },
        ] as const).map((f) => {
          const on = filter === f.id;
          return (
            <button key={f.id} type="button" onClick={() => setFilter(f.id)} className="alt-tap"
              style={{
                appearance: 'none', height: 30, padding: '0 12px', borderRadius: 999,
                background: on ? 'var(--ink)' : 'var(--paper)',
                color: on ? 'var(--paper)' : 'var(--ink-2)',
                border: `1px solid ${on ? 'var(--ink)' : 'var(--line)'}`,
                fontSize: 12, fontWeight: 500,
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
              {f.l}
              <span className="alt-mono" style={{ fontSize: 10, opacity: 0.65 }}>{f.n}</span>
            </button>
          );
        })}
      </div>

      <div className="alt-screen-body alt-scroll" style={{ padding: '0 20px 40px' }}>
        <div className="alt-card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--paper-2)', marginBottom: 14 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: 'var(--ink)', color: 'var(--paper)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--f-mono)', fontWeight: 600, fontSize: 11, letterSpacing: '0.02em',
          }}>CTME</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 500 }}>Contracts live in CTME</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1 }}>
              Altitude mirrors what&apos;s signed. Tap a status to update it.
            </div>
          </div>
          <div style={{ color: 'var(--ink-3)' }}>{Icon.chevR()}</div>
        </div>

        {filter === 'all' && (
          <>
            {([
              { label: 'Received', list: groups.received },
              { label: 'Pending', list: groups.pending },
              { label: 'Upcoming', list: groups.upcoming },
              { label: 'Marked N/A (hidden from summaries)', list: groups.na },
            ]).map((section) => section.list.length > 0 && (
              <div key={section.label}>
                <div className="alt-eyebrow" style={{ padding: '0 4px 8px' }}>{section.label} · {section.list.length}</div>
                <div className="alt-card" style={{ padding: 0, marginBottom: 14, overflow: 'hidden' }}>
                  {section.list.map((doc) => <DocRow key={doc.id} doc={doc} onCycle={cycle}/>)}
                </div>
              </div>
            ))}
          </>
        )}
        {filter !== 'all' && (
          <div className="alt-card" style={{ padding: 0, overflow: 'hidden' }}>
            {(filter === 'received' ? groups.received :
              filter === 'pending' ? [...groups.pending, ...groups.upcoming] :
              groups.na).map((doc) => <DocRow key={doc.id} doc={doc} onCycle={cycle}/>)}
          </div>
        )}
      </div>
    </>
  );
}
