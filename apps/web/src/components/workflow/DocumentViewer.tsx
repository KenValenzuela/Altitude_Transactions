'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {api} from '@/lib/api-client';
import type {SourceDocument} from '@/types/domain';

interface Props {
    document: SourceDocument;
    onClose: () => void;
}

type State = 'loading' | 'ready' | 'error';

// ── Icons ─────────────────────────────────────────────────────
function IcClose() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 6 6 18"/>
        <path d="m6 6 12 12"/>
    </svg>;
}

function IcDownload() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>;
}

function IcFile() {
    return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
    </svg>;
}

function IcAlertCircle() {
    return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>;
}

function IcSpinner() {
    return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" className="alt-spin" aria-hidden="true">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>;
}

// ── Document viewer modal ─────────────────────────────────────
export function DocumentViewer({document: doc, onClose}: Props) {
    const [state, setState] = useState<State>('loading');
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const prevBlobRef = useRef<string | null>(null);
    const backdropRef = useRef<HTMLDivElement>(null);

    const isMac =
        typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');
    const searchKey = isMac ? '⌘F' : 'Ctrl+F';

    const loadDoc = useCallback(async () => {
        setState('loading');
        // Clean up any previous blob URL
        if (prevBlobRef.current) {
            URL.revokeObjectURL(prevBlobRef.current);
            prevBlobRef.current = null;
        }
        setBlobUrl(null);
        try {
            const blob = await api.getDocumentBlob(doc.id);
            const url = URL.createObjectURL(blob);
            prevBlobRef.current = url;
            setBlobUrl(url);
            setState('ready');
        } catch {
            setState('error');
        }
    }, [doc.id]);

    useEffect(() => {
        void loadDoc();
        return () => {
            if (prevBlobRef.current) URL.revokeObjectURL(prevBlobRef.current);
        };
    }, [loadDoc]);

    // Close on Escape
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }

        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    function onBackdropClick(e: React.MouseEvent) {
        if (e.target === backdropRef.current) onClose();
    }

    const isPdf =
        doc.mimeType === 'application/pdf' ||
        doc.filename.toLowerCase().endsWith('.pdf');

    return (
        <div
            className="dk-docviewer-backdrop"
            ref={backdropRef}
            onClick={onBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="docviewer-title"
        >
            {/* ── Header ── */}
            <div className="dk-docviewer-header">
                <button className="dk-backbtn" onClick={onClose} aria-label="Close document viewer">
                    <IcClose/>
                </button>

                <span id="docviewer-title" className="dk-docviewer-title">{doc.filename}</span>

                {isPdf && state === 'ready' && (
                    <span className="dk-docviewer-hint" aria-label="PDF search tip">
            Click inside, then press <strong>{searchKey}</strong> to search
          </span>
                )}

                {blobUrl && (
                    <a
                        href={blobUrl}
                        download={doc.filename}
                        className="dk-btn dk-secondary sm"
                        style={{
                            flexShrink: 0,
                            color: 'var(--fg1-on-navy)',
                            borderColor: 'rgba(255,255,255,.2)',
                            background: 'rgba(255,255,255,.07)'
                        }}
                        aria-label={`Download ${doc.filename}`}
                    >
                        <IcDownload/> Download
                    </a>
                )}
            </div>

            {/* ── Body ── */}
            <div className="dk-docviewer-body">
                {state === 'loading' && (
                    <div className="dk-docviewer-state">
                        <div className="dk-docviewer-state-icon"><IcSpinner/></div>
                        <div className="dk-docviewer-state-title">Loading document…</div>
                        <div className="dk-docviewer-state-sub">Securely fetching {doc.filename}</div>
                    </div>
                )}

                {state === 'error' && (
                    <div className="dk-docviewer-state">
                        <div className="dk-docviewer-state-icon"><IcAlertCircle/></div>
                        <div className="dk-docviewer-state-title">Preview unavailable</div>
                        <div className="dk-docviewer-state-sub">
                            {doc.filename} could not be loaded for in-app preview.
                            You can still download the file.
                        </div>
                        <div style={{
                            display: 'flex',
                            gap: 10,
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            marginTop: 8
                        }}>
                            <button
                                className="dk-btn dk-secondary sm"
                                onClick={() => void loadDoc()}
                                style={{
                                    color: 'var(--fg1-on-navy)',
                                    borderColor: 'rgba(255,255,255,.2)',
                                    background: 'rgba(255,255,255,.07)'
                                }}
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )}

                {state === 'ready' && blobUrl && (
                    <iframe
                        className="dk-docviewer-iframe"
                        src={blobUrl}
                        title={`Document: ${doc.filename}`}
                        aria-label={`Document viewer: ${doc.filename}`}
                    />
                )}
            </div>
        </div>
    );
}

// ── Trigger button and source documents list ──────────────────
function IcFileSmall() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
    </svg>;
}

function IcEye() {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>;
}

function formatBytes(bytes?: number): string {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
}

export function SourceDocumentList({documents}: { documents: SourceDocument[] }) {
    const [viewing, setViewing] = useState<SourceDocument | null>(null);

    if (!documents.length) {
        return (
            <div className="empty-state" style={{minHeight: '7rem'}}>
                <p className="body-sm muted">No source documents uploaded yet.</p>
            </div>
        );
    }

    return (
        <>
            <div className="dk-list" aria-label="Uploaded source documents">
                {documents.map((doc) => (
                    <div key={doc.id} className="dk-sourcedoc-row">
            <span className="dk-sourcedoc-icon">
              <IcFileSmall/>
            </span>
                        <div className="dk-sourcedoc-body">
                            <div className="dk-sourcedoc-name">{doc.filename}</div>
                            <div className="dk-sourcedoc-meta">
                                {[doc.documentType, formatBytes(doc.fileSizeBytes), formatDate(doc.uploadedAt)]
                                    .filter(Boolean)
                                    .join(' · ')}
                            </div>
                        </div>
                        <button
                            className="dk-btn dk-secondary sm"
                            onClick={() => setViewing(doc)}
                            aria-label={`View ${doc.filename}`}
                        >
                            <IcEye/> View
                        </button>
                    </div>
                ))}
            </div>

            {viewing && (
                <DocumentViewer document={viewing} onClose={() => setViewing(null)}/>
            )}
        </>
    );
}
