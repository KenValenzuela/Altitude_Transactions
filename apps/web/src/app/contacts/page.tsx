'use client';

import {type ReactNode, useMemo, useState} from 'react';
import {AppShell} from '@/components/workflow/AppShell';

// ── Icons ──────────────────────────────────────────────────────
function IcWrench() {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path
            d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>;
}

function IcDroplet() {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>;
}

function IcWind() {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
        <path d="M9.6 4.6A2 2 0 1 1 11 8H2"/>
        <path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
    </svg>;
}

function IcZap() {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>;
}

function IcRoof() {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>;
}

function IcHammer() {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m15 12-8.373 8.373a1 1 0 1 1-3-3l8.373-8.373"/>
        <path d="m18 15 4-4"/>
        <path
            d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91Z"/>
    </svg>;
}

function IcBug() {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="8" y="6" width="8" height="14" rx="4"/>
        <path d="m19 7-3 2"/>
        <path d="m5 7 3 2"/>
        <path d="m19 19-3-2"/>
        <path d="m5 19 3-2"/>
        <path d="M20 13h-4"/>
        <path d="M4 13h4"/>
        <path d="m10 4 1-2 1 2"/>
    </svg>;
}

function IcFileCheck() {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
        <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
        <path d="m9 15 2 2 4-4"/>
    </svg>;
}

function IcDollar() {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="12" y1="2" x2="12" y2="22"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>;
}

function IcScale() {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
        <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
        <path d="M7 21h10"/>
        <path d="M12 3v18"/>
        <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
    </svg>;
}

function IcCamera() {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
        <circle cx="12" cy="13" r="3"/>
    </svg>;
}

function IcSofa() {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path
            d="M20 9V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h4m12-11a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16Z"/>
        <path d="M8 21v-4m8 4v-4"/>
    </svg>;
}

function IcTruck() {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
        <rect x="9" y="11" width="14" height="10" rx="2"/>
        <circle cx="12" cy="21" r="1"/>
        <circle cx="20" cy="21" r="1"/>
    </svg>;
}

function IcLeaf() {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>;
}

function IcStarFill() {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5"
                aria-hidden="true">
        <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>;
}

function IcStar() {
    return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>;
}

function IcChevron({open}: { open: boolean }) {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round" style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 180ms cubic-bezier(.2,.6,.2,1)'
        }} aria-hidden="true">
            <path d="m6 9 6 6 6-6"/>
        </svg>
    );
}

function IcPlus() {
    return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14"/>
        <path d="M12 5v14"/>
    </svg>;
}

function IcEdit() {
    return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>;
}

function IcX() {
    return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 6 6 18"/>
        <path d="m6 6 12 12"/>
    </svg>;
}

function IcCheck() {
    return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12"/>
    </svg>;
}

// ── Types ──────────────────────────────────────────────────────
type TradeId =
    | 'inspection' | 'plumbing' | 'hvac' | 'electrical' | 'roofing'
    | 'handyman' | 'pest' | 'title' | 'lending' | 'attorney'
    | 'photography' | 'staging' | 'moving' | 'landscaping';

interface Vendor {
    id: string;
    name: string;
    company?: string;
    trade: TradeId;
    phone?: string;
    email?: string;
    notes?: string;
    preferred?: boolean;
    rating?: number;
}

// ── Trade registry ─────────────────────────────────────────────
const TRADES: { id: TradeId; label: string; icon: ReactNode }[] = [
    {id: 'inspection', label: 'Home Inspection', icon: <IcWrench/>},
    {id: 'plumbing', label: 'Plumbing', icon: <IcDroplet/>},
    {id: 'hvac', label: 'HVAC', icon: <IcWind/>},
    {id: 'electrical', label: 'Electrical', icon: <IcZap/>},
    {id: 'roofing', label: 'Roofing', icon: <IcRoof/>},
    {id: 'handyman', label: 'Handyman', icon: <IcHammer/>},
    {id: 'pest', label: 'Pest Control', icon: <IcBug/>},
    {id: 'title', label: 'Title & Escrow', icon: <IcFileCheck/>},
    {id: 'lending', label: 'Lending', icon: <IcDollar/>},
    {id: 'attorney', label: 'Real Estate Attorney', icon: <IcScale/>},
    {id: 'photography', label: 'Photography', icon: <IcCamera/>},
    {id: 'staging', label: 'Home Staging', icon: <IcSofa/>},
    {id: 'moving', label: 'Moving', icon: <IcTruck/>},
    {id: 'landscaping', label: 'Landscaping', icon: <IcLeaf/>},
];

// Trade chip colors — design token vars
const CHIP: Record<TradeId, { bg: string; text: string; border: string }> = {
    inspection: {bg: 'var(--info-surface)', text: 'var(--info-text)', border: 'var(--info-line)'},
    plumbing: {bg: '#dbeafe', text: '#1e3a8a', border: '#bfdbfe'},
    hvac: {bg: '#fff7ed', text: '#9a3412', border: '#fed7aa'},
    electrical: {bg: '#fefce8', text: '#713f12', border: '#fde68a'},
    roofing: {bg: '#f5f3ff', text: '#4c1d95', border: '#ddd6fe'},
    handyman: {bg: 'var(--warn-surface)', text: 'var(--warn-text)', border: 'var(--warn-line)'},
    pest: {bg: 'var(--ok-surface)', text: 'var(--ok-text)', border: 'var(--ok-line)'},
    title: {bg: '#f0fdf4', text: '#14532d', border: '#bbf7d0'},
    lending: {bg: '#fdf4ff', text: '#581c87', border: '#e9d5ff'},
    attorney: {bg: '#eff6ff', text: '#1e3a5f', border: '#bfdbfe'},
    photography: {bg: '#fff1f2', text: '#881337', border: '#fecdd3'},
    staging: {bg: '#fdf2f8', text: '#701a75', border: '#f5d0fe'},
    moving: {bg: 'var(--neutral-surface)', text: 'var(--neutral)', border: 'var(--neutral-line)'},
    landscaping: {bg: '#f7fee7', text: '#365314', border: '#d9f99d'},
};

// ── Seed vendor data ───────────────────────────────────────────
const SEED_VENDORS: Vendor[] = [
    {
        id: 'v1',
        trade: 'inspection',
        name: 'Mike Torres',
        company: 'Torres Home Inspections',
        phone: '(720) 555-0142',
        email: 'mike@torreshome.com',
        notes: 'ASHI certified, 24-hr reports',
        preferred: true,
        rating: 5
    },
    {
        id: 'v2',
        trade: 'inspection',
        name: 'Apex Inspections',
        phone: '(303) 555-0187',
        email: 'info@apexinspect.com',
        preferred: false,
        rating: 4
    },
    {
        id: 'v3',
        trade: 'plumbing',
        name: 'Jake Rivera',
        company: 'Rivera Plumbing Co.',
        phone: '(720) 555-0231',
        email: 'jake@riveraplumbing.com',
        notes: '15% agent discount, 24/7 avail.',
        preferred: true,
        rating: 5
    },
    {
        id: 'v4',
        trade: 'plumbing',
        name: 'Front Range Plumbing',
        phone: '(303) 555-0294',
        email: 'service@frontrangeplumbing.com',
        preferred: false,
        rating: 4
    },
    {
        id: 'v5',
        trade: 'hvac',
        name: 'Cold Springs HVAC',
        company: 'Cold Springs H&C',
        phone: '(720) 555-0318',
        email: 'schedule@coldspringshvac.com',
        notes: 'Next-day service',
        preferred: true,
        rating: 5
    },
    {
        id: 'v6',
        trade: 'hvac',
        name: 'Summit Climate',
        phone: '(303) 555-0367',
        email: 'info@summitclimate.com',
        preferred: false,
        rating: 3
    },
    {
        id: 'v7',
        trade: 'electrical',
        name: 'Rocky Mtn Electric',
        company: 'Rocky Mountain Electric',
        phone: '(720) 555-0441',
        email: 'work@rmelectric.com',
        notes: 'Panel upgrades specialist',
        preferred: true,
        rating: 5
    },
    {
        id: 'v8',
        trade: 'roofing',
        name: 'Alpine Roofing',
        company: 'Alpine Roofing LLC',
        phone: '(303) 555-0512',
        email: 'bids@alpineroofing.com',
        notes: 'Free agent inspections',
        preferred: true,
        rating: 4
    },
    {
        id: 'v9',
        trade: 'roofing',
        name: 'Summit Shingles',
        phone: '(720) 555-0578',
        email: 'contact@summitshingles.com',
        preferred: false,
        rating: 3
    },
    {
        id: 'v10',
        trade: 'handyman',
        name: 'Carlos Mendez',
        company: 'Mendez Home Services',
        phone: '(720) 555-0623',
        email: 'carlos@mendezservices.com',
        notes: 'Quick turnaround, fair pricing',
        preferred: true,
        rating: 5
    },
    {
        id: 'v11',
        trade: 'pest',
        name: 'Green Shield Pest',
        company: 'Green Shield Pest Control',
        phone: '(303) 555-0714',
        email: 'schedule@greenshieldpest.com',
        notes: 'WDO reports for closings',
        preferred: true,
        rating: 5
    },
    {
        id: 'v12',
        trade: 'title',
        name: 'Sarah Chen',
        company: 'Pinnacle Title Group',
        phone: '(720) 555-0832',
        email: 'schen@pinnacletitle.com',
        notes: 'Preferred closer, fast turnaround',
        preferred: true,
        rating: 5
    },
    {
        id: 'v13',
        trade: 'title',
        name: 'Front Range Title',
        company: 'Front Range Title Co.',
        phone: '(303) 555-0871',
        email: 'close@frontrangetitle.com',
        preferred: false,
        rating: 4
    },
    {
        id: 'v14',
        trade: 'lending',
        name: 'David Park',
        company: 'Summit Mortgage',
        phone: '(720) 555-0923',
        email: 'dpark@summitmortgage.com',
        notes: 'Pre-approval in 24 hrs',
        preferred: true,
        rating: 5
    },
    {
        id: 'v15',
        trade: 'lending',
        name: 'Mile High Loans',
        phone: '(303) 555-0987',
        email: 'rates@milehighloans.com',
        preferred: false,
        rating: 4
    },
    {
        id: 'v16',
        trade: 'attorney',
        name: 'Lisa Thornton',
        company: 'Thornton Real Estate Law',
        phone: '(720) 555-1043',
        email: 'lthornton@thorntonrelaw.com',
        notes: 'Contract disputes & closings',
        preferred: true,
        rating: 5
    },
    {
        id: 'v17',
        trade: 'photography',
        name: 'Nate Yamamoto',
        company: 'Elevation Photography',
        phone: '(303) 555-1128',
        email: 'nate@elevationphoto.com',
        notes: 'Drone + twilight packages',
        preferred: true,
        rating: 5
    },
    {
        id: 'v18',
        trade: 'photography',
        name: 'Clear Sky Photos',
        phone: '(720) 555-1187',
        email: 'bookings@clearskyphotos.com',
        preferred: false,
        rating: 4
    },
    {
        id: 'v19',
        trade: 'staging',
        name: 'Aria Interiors',
        company: 'Aria Staging & Design',
        phone: '(303) 555-1242',
        email: 'aria@ariainteriors.com',
        notes: 'Full + partial staging available',
        preferred: true,
        rating: 5
    },
    {
        id: 'v20',
        trade: 'moving',
        name: 'Summit Movers',
        company: 'Summit Moving Co.',
        phone: '(720) 555-1334',
        email: 'quote@summitmovers.com',
        notes: 'Agent referral rate available',
        preferred: true,
        rating: 4
    },
    {
        id: 'v21',
        trade: 'landscaping',
        name: 'Green Thumb Crew',
        company: 'Green Thumb Landscaping',
        phone: '(303) 555-1421',
        email: 'hello@greenthumbcrew.com',
        notes: 'Pre-listing cleanup specials',
        preferred: false,
        rating: 4
    },
];

// ── Helpers ───────────────────────────────────────────────────
function RatingDots({rating}: { rating: number }) {
    return (
        <span style={{display: 'inline-flex', gap: 3}} aria-label={`${rating} out of 5`}>
      {Array.from({length: 5}, (_, i) => (
          <span key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: i < rating ? 'var(--gold-bright)' : 'var(--neutral-surface)',
              border: i < rating ? 'none' : '1px solid var(--line-strong)',
              display: 'inline-block',
          }}/>
      ))}
    </span>
    );
}

function TradePill({trade}: { trade: TradeId }) {
    const c = CHIP[trade];
    const t = TRADES.find((t) => t.id === trade);
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
            whiteSpace: 'nowrap', background: c.bg, color: c.text, border: `1px solid ${c.border}`,
            fontFamily: 'var(--font-sans)',
        }}>
      {t?.icon} {t?.label}
    </span>
    );
}

// ── Vendor edit form (inline) ─────────────────────────────────
interface EditDraft {
    name: string;
    company: string;
    phone: string;
    email: string;
    notes: string;
}

function VendorEditRow({
                           vendor,
                           onSave,
                           onCancel,
                       }: {
    vendor: Vendor;
    onSave: (updated: Vendor) => void;
    onCancel: () => void;
}) {
    const [draft, setDraft] = useState<EditDraft>({
        name: vendor.name, company: vendor.company ?? '', phone: vendor.phone ?? '',
        email: vendor.email ?? '', notes: vendor.notes ?? '',
    });

    return (
        <tr style={{background: 'var(--bg-surface-2)'}}>
            <td colSpan={6} style={{padding: '14px 18px'}}>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10}}>
                    {([
                        {key: 'name', label: 'Name', type: 'text', ph: 'Full name'},
                        {key: 'company', label: 'Company', type: 'text', ph: 'Company'},
                        {key: 'phone', label: 'Phone', type: 'tel', ph: '(303) 555-0100'},
                        {key: 'email', label: 'Email', type: 'email', ph: 'email@example.com'},
                        {key: 'notes', label: 'Notes', type: 'text', ph: 'Notes'},
                    ] as { key: keyof EditDraft; label: string; type: string; ph: string }[]).map(({
                                                                                                       key,
                                                                                                       label,
                                                                                                       type,
                                                                                                       ph
                                                                                                   }) => (
                        <div key={key} style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                            <label
                                htmlFor={`ve-${vendor.id}-${key}`}
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: 10,
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    color: 'var(--fg3)'
                                }}
                            >
                                {label}
                            </label>
                            <input
                                id={`ve-${vendor.id}-${key}`}
                                type={type}
                                value={draft[key]}
                                onChange={(e) => setDraft((p) => ({...p, [key]: e.target.value}))}
                                placeholder={ph}
                                style={{
                                    height: 34, padding: '0 9px',
                                    border: '1px solid var(--line-strong)', borderRadius: 'var(--r-sm)',
                                    background: 'var(--bg-surface)', fontFamily: 'var(--font-sans)',
                                    fontSize: 13, color: 'var(--fg1)', outline: 'none',
                                }}
                            />
                        </div>
                    ))}
                </div>
                <div style={{display: 'flex', gap: 8, marginTop: 12}}>
                    <button
                        className="dk-btn dk-primary sm"
                        onClick={() => onSave({...vendor, ...draft})}
                    >
                        <IcCheck/> Save
                    </button>
                    <button className="dk-btn dk-secondary sm" onClick={onCancel}>
                        <IcX/> Cancel
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ── Add vendor form (modal-like inline) ───────────────────────
interface AddDraft {
    name: string;
    company: string;
    phone: string;
    email: string;
    notes: string;
    trade: TradeId;
}

function AddVendorPanel({
                            defaultTrade,
                            onSave,
                            onCancel,
                        }: {
    defaultTrade: TradeId;
    onSave: (v: Vendor) => void;
    onCancel: () => void;
}) {
    const [draft, setDraft] = useState<AddDraft>({
        name: '', company: '', phone: '', email: '', notes: '', trade: defaultTrade,
    });
    const [error, setError] = useState('');

    function submit() {
        if (!draft.name.trim()) {
            setError('Name is required.');
            return;
        }
        const newVendor: Vendor = {
            id: `new-${Date.now()}`,
            name: draft.name.trim(),
            company: draft.company.trim() || undefined,
            phone: draft.phone.trim() || undefined,
            email: draft.email.trim() || undefined,
            notes: draft.notes.trim() || undefined,
            trade: draft.trade,
            preferred: false,
            rating: 0,
        };
        onSave(newVendor);
    }

    return (
        <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--brass-300)', borderRadius: 'var(--r-lg)',
            padding: '18px 20px', boxShadow: 'var(--shadow-md)', marginTop: 12,
        }}>
            <div style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 600,
                fontSize: 17,
                color: 'var(--fg1)',
                marginBottom: 14
            }}>
                Add vendor
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10}}>
                {/* Trade selector */}
                <div style={{display: 'flex', flexDirection: 'column', gap: 4, gridColumn: '1 / -1'}}>
                    <label htmlFor="av-trade" style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--fg3)'
                    }}>
                        Trade
                    </label>
                    <select
                        id="av-trade"
                        value={draft.trade}
                        onChange={(e) => setDraft((p) => ({...p, trade: e.target.value as TradeId}))}
                        style={{
                            height: 36,
                            padding: '0 9px',
                            border: '1px solid var(--line-strong)',
                            borderRadius: 'var(--r-sm)',
                            background: 'var(--bg-surface)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: 13.5,
                            color: 'var(--fg1)',
                            outline: 'none',
                        }}
                    >
                        {TRADES.map((t) => (
                            <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                    </select>
                </div>

                {([
                    {key: 'name', label: 'Name *', type: 'text', ph: 'Full name'},
                    {key: 'company', label: 'Company', type: 'text', ph: 'Company name'},
                    {key: 'phone', label: 'Phone', type: 'tel', ph: '(303) 555-0100'},
                    {key: 'email', label: 'Email', type: 'email', ph: 'email@example.com'},
                    {key: 'notes', label: 'Notes', type: 'text', ph: 'Notes'},
                ] as { key: keyof AddDraft; label: string; type: string; ph: string }[]).map(({
                                                                                                  key,
                                                                                                  label,
                                                                                                  type,
                                                                                                  ph
                                                                                              }) => (
                    <div key={key} style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                        <label htmlFor={`av-${key}`} style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: 'var(--fg3)'
                        }}>
                            {label}
                        </label>
                        <input
                            id={`av-${key}`}
                            type={type}
                            value={draft[key as keyof AddDraft]}
                            onChange={(e) => setDraft((p) => ({...p, [key]: e.target.value}))}
                            placeholder={ph}
                            style={{
                                height: 36,
                                padding: '0 9px',
                                border: '1px solid var(--line-strong)',
                                borderRadius: 'var(--r-sm)',
                                background: 'var(--bg-surface)',
                                fontFamily: 'var(--font-sans)',
                                fontSize: 13.5,
                                color: 'var(--fg1)',
                                outline: 'none',
                            }}
                        />
                    </div>
                ))}
            </div>

            {error && (
                <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12.5,
                    color: 'var(--risk-text)',
                    marginTop: 10,
                    background: 'var(--risk-surface)',
                    border: '1px solid var(--risk-line)',
                    borderRadius: 'var(--r-sm)',
                    padding: '6px 10px'
                }} role="alert">
                    {error}
                </p>
            )}

            <div style={{display: 'flex', gap: 8, marginTop: 14}}>
                <button className="dk-btn dk-primary sm" onClick={submit}>
                    Add vendor
                </button>
                <button className="dk-btn dk-secondary sm" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </div>
    );
}

// ── Page component ─────────────────────────────────────────────
export default function ContactsPage() {
    const [vendors, setVendors] = useState<Vendor[]>(SEED_VENDORS);
    const [query, setQuery] = useState('');
    const [activeTrade, setActiveTrade] = useState<TradeId | 'all'>('all');
    const [collapsed, setCollapsed] = useState<Set<TradeId>>(new Set());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [addingTrade, setAddingTrade] = useState<TradeId | null>(null);

    const filtered = useMemo(() => {
        let list = vendors;
        if (activeTrade !== 'all') list = list.filter((v) => v.trade === activeTrade);
        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter((v) =>
                v.name.toLowerCase().includes(q) ||
                (v.company ?? '').toLowerCase().includes(q) ||
                (v.email ?? '').toLowerCase().includes(q) ||
                (v.phone ?? '').includes(q) ||
                (v.notes ?? '').toLowerCase().includes(q),
            );
        }
        return list;
    }, [vendors, query, activeTrade]);

    const visibleTrades = useMemo(
        () => TRADES.filter((t) => filtered.some((v) => v.trade === t.id)),
        [filtered],
    );

    function toggleCollapse(id: TradeId) {
        setCollapsed((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    function saveEdit(updated: Vendor) {
        setVendors((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
        setEditingId(null);
    }

    function saveAdd(newVendor: Vendor) {
        setVendors((prev) => [...prev, newVendor]);
        setAddingTrade(null);
    }

    const preferredCount = vendors.filter((v) => v.preferred).length;

    return (
        <AppShell>
            {/* Page header */}
            <div className="dk-pagehead dk-global-head">
                <div>
                    <div className="dk-eyebrow">My Network</div>
                    <h1 className="dk-h1">Vendor Rolodex</h1>
                    <p className="dk-sub">{vendors.length} contacts across {TRADES.length} trades</p>
                </div>
                <div style={{display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap'}}>
          <span className="dk-badge dk-badge--ok">
            <IcStarFill/> {preferredCount} preferred
          </span>
                    <span className="dk-badge dk-badge--neutral">{vendors.length} total</span>
                </div>
            </div>

            {/* Search + trade filter */}
            <div style={{marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12}}>
                <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name, company, or phone…"
                    aria-label="Search vendors"
                    style={{
                        height: 40, padding: '0 14px', borderRadius: 'var(--r-md)',
                        border: '1px solid var(--line-strong)', background: 'var(--bg-surface)',
                        color: 'var(--fg1)', fontFamily: 'var(--font-sans)', fontSize: 13.5,
                        outline: 'none', width: '100%', maxWidth: 440,
                    }}
                    onFocus={(e) => {
                        (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px var(--focus-ring)';
                        (e.target as HTMLInputElement).style.borderColor = 'var(--brass-500)';
                    }}
                    onBlur={(e) => {
                        (e.target as HTMLInputElement).style.boxShadow = '';
                        (e.target as HTMLInputElement).style.borderColor = 'var(--line-strong)';
                    }}
                />

                <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
                    <button
                        onClick={() => setActiveTrade('all')}
                        style={{
                            display: 'inline-flex', alignItems: 'center', padding: '6px 12px',
                            borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            border: '1px solid', fontFamily: 'var(--font-sans)',
                            background: activeTrade === 'all' ? 'var(--ink-900)' : 'var(--bg-surface)',
                            color: activeTrade === 'all' ? '#f3ecde' : 'var(--fg2)',
                            borderColor: activeTrade === 'all' ? 'var(--ink-900)' : 'var(--line)',
                            transition: 'all var(--t-fast)',
                        }}
                    >
                        All Trades
                    </button>

                    {TRADES.map((t) => {
                        const active = activeTrade === t.id;
                        const c = CHIP[t.id];
                        return (
                            <button
                                key={t.id}
                                onClick={() => setActiveTrade(active ? 'all' : t.id)}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 5,
                                    padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                                    cursor: 'pointer', border: '1px solid', fontFamily: 'var(--font-sans)',
                                    background: active ? c.bg : 'var(--bg-surface)',
                                    color: active ? c.text : 'var(--fg3)',
                                    borderColor: active ? c.border : 'var(--line)',
                                    transition: 'all var(--t-fast)',
                                }}
                            >
                                {t.icon} {t.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Vendor groups */}
            {filtered.length === 0 ? (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '48px 16px',
                    textAlign: 'center'
                }}>
                    <p style={{fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--fg3)'}}>
                        No vendors match your search.
                    </p>
                    <button
                        style={{
                            marginTop: 12,
                            fontFamily: 'var(--font-sans)',
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: 'var(--fg-brass)',
                            cursor: 'pointer',
                            background: 'none',
                            border: 'none'
                        }}
                        onClick={() => {
                            setQuery('');
                            setActiveTrade('all');
                        }}
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
                    {visibleTrades.map((trade) => {
                        const tradeVendors = filtered.filter((v) => v.trade === trade.id);
                        if (!tradeVendors.length) return null;
                        const isCollapsed = collapsed.has(trade.id);
                        const c = CHIP[trade.id];
                        const isAddingHere = addingTrade === trade.id;

                        return (
                            <section key={trade.id} aria-labelledby={`trade-hd-${trade.id}`}>
                                {/* Group header */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: 8,
                                    paddingInline: 2
                                }}>
                                    <button
                                        id={`trade-hd-${trade.id}`}
                                        onClick={() => toggleCollapse(trade.id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                                            background: 'transparent', border: 'none', padding: 0, minHeight: 44,
                                        }}
                                        aria-expanded={!isCollapsed}
                                        aria-controls={`trade-body-${trade.id}`}
                                    >
                    <span style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                        background: c.bg, color: c.text, border: `1px solid ${c.border}`,
                    }}>
                      {trade.icon}
                    </span>
                                        <span style={{
                                            fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10.5,
                                            textTransform: 'uppercase', letterSpacing: '0.10em', color: 'var(--fg2)',
                                        }}>
                      {trade.label}
                    </span>
                                        <span style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: 11,
                                            fontWeight: 600,
                                            padding: '1px 7px',
                                            borderRadius: 999,
                                            background: 'var(--neutral-surface)',
                                            color: 'var(--fg3)',
                                            border: '1px solid var(--neutral-line)',
                                        }}>
                      {tradeVendors.length}
                    </span>
                                        <span style={{color: 'var(--fg3)'}}><IcChevron open={!isCollapsed}/></span>
                                    </button>

                                    <button
                                        className="dk-vendor-addlink"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            height: 32,
                                            padding: '0 12px',
                                            borderRadius: 7,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            color: 'var(--fg-brass)',
                                            border: '1px solid var(--line)',
                                            background: 'var(--bg-surface)',
                                            fontFamily: 'var(--font-sans)',
                                        }}
                                        onClick={() => setAddingTrade(isAddingHere ? null : trade.id)}
                                        aria-label={`Add ${trade.label} vendor`}
                                    >
                                        <IcPlus/> Add vendor
                                    </button>
                                </div>

                                {/* Add vendor form */}
                                {isAddingHere && (
                                    <AddVendorPanel
                                        defaultTrade={trade.id}
                                        onSave={saveAdd}
                                        onCancel={() => setAddingTrade(null)}
                                    />
                                )}

                                {/* Vendor table */}
                                {!isCollapsed && (
                                    <div
                                        id={`trade-body-${trade.id}`}
                                        style={{
                                            overflowX: 'auto',
                                            borderRadius: 'var(--r-md)',
                                            border: '1px solid var(--line)',
                                            background: 'var(--bg-surface)',
                                            boxShadow: 'var(--shadow-sm)',
                                        }}
                                    >
                                        <table style={{
                                            width: '100%',
                                            minWidth: 580,
                                            borderCollapse: 'collapse',
                                            fontFamily: 'var(--font-sans)'
                                        }}>
                                            <caption className="sr-only">{trade.label} vendors</caption>
                                            <thead>
                                            <tr style={{
                                                background: 'var(--bg-surface-2)',
                                                borderBottom: '1px solid var(--line)'
                                            }}>
                                                <th style={{
                                                    width: 40,
                                                    paddingLeft: 16,
                                                    paddingRight: 8,
                                                    paddingTop: 10,
                                                    paddingBottom: 10
                                                }} aria-label="Preferred"><span className="sr-only">Preferred</span>
                                                </th>
                                                <th style={{
                                                    padding: '10px 16px',
                                                    textAlign: 'left',
                                                    fontSize: 10.5,
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.09em',
                                                    color: 'var(--fg-brass)'
                                                }}>Name
                                                </th>
                                                <th style={{
                                                    padding: '10px 16px',
                                                    textAlign: 'left',
                                                    fontSize: 10.5,
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.09em',
                                                    color: 'var(--fg-brass)'
                                                }}>Phone
                                                </th>
                                                <th style={{
                                                    padding: '10px 16px',
                                                    textAlign: 'left',
                                                    fontSize: 10.5,
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.09em',
                                                    color: 'var(--fg-brass)'
                                                }}>Email
                                                </th>
                                                <th style={{
                                                    padding: '10px 16px',
                                                    textAlign: 'left',
                                                    fontSize: 10.5,
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.09em',
                                                    color: 'var(--fg-brass)'
                                                }}>Notes
                                                </th>
                                                <th style={{
                                                    padding: '10px 16px',
                                                    textAlign: 'right',
                                                    fontSize: 10.5,
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.09em',
                                                    color: 'var(--fg-brass)'
                                                }}>Rating
                                                </th>
                                                <th style={{padding: '10px 16px', width: 60}}><span
                                                    className="sr-only">Actions</span></th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {tradeVendors.map((v, i) => {
                                                const isEditing = editingId === v.id;
                                                if (isEditing) {
                                                    return (
                                                        <VendorEditRow
                                                            key={v.id}
                                                            vendor={v}
                                                            onSave={saveEdit}
                                                            onCancel={() => setEditingId(null)}
                                                        />
                                                    );
                                                }
                                                return (
                                                    <tr
                                                        key={v.id}
                                                        className="dk-vendor-row"
                                                        style={{borderTop: i > 0 ? '1px solid var(--line)' : undefined}}
                                                    >
                                                        <td style={{
                                                            paddingLeft: 16,
                                                            paddingRight: 8,
                                                            paddingTop: 12,
                                                            paddingBottom: 12,
                                                            width: 40
                                                        }}>
                                                            {v.preferred && (
                                                                <span style={{color: 'var(--gold-bright)'}}
                                                                      title="Preferred vendor"><IcStarFill/></span>
                                                            )}
                                                        </td>
                                                        <td style={{padding: '12px 16px'}}>
                                                            <div style={{
                                                                fontWeight: 600,
                                                                fontSize: 13.5,
                                                                color: 'var(--fg1)'
                                                            }}>{v.name}</div>
                                                            {v.company && (
                                                                <div style={{
                                                                    fontSize: 11.5,
                                                                    color: 'var(--fg3)',
                                                                    marginTop: 2
                                                                }}>{v.company}</div>
                                                            )}
                                                        </td>
                                                        <td style={{padding: '12px 16px', whiteSpace: 'nowrap'}}>
                                                            {v.phone
                                                                ? <a href={`tel:${v.phone}`} style={{
                                                                    color: 'var(--fg2)',
                                                                    fontFamily: 'var(--font-mono)',
                                                                    fontSize: 12.5
                                                                }}>{v.phone}</a>
                                                                : <span style={{color: 'var(--fg3)'}}>—</span>}
                                                        </td>
                                                        <td style={{padding: '12px 16px'}}>
                                                            {v.email
                                                                ? <a href={`mailto:${v.email}`} style={{
                                                                    color: 'var(--fg2)',
                                                                    fontSize: 12.5
                                                                }}>{v.email}</a>
                                                                : <span style={{color: 'var(--fg3)'}}>—</span>}
                                                        </td>
                                                        <td style={{padding: '12px 16px', maxWidth: 200}}>
                                                            {v.notes
                                                                ? <span style={{
                                                                    fontSize: 12.5,
                                                                    color: 'var(--fg3)',
                                                                    display: 'block',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap'
                                                                }} title={v.notes}>{v.notes}</span>
                                                                : <span style={{color: 'var(--line-strong)'}}>—</span>}
                                                        </td>
                                                        <td style={{padding: '12px 16px', textAlign: 'right'}}>
                                                            {v.rating != null && <RatingDots rating={v.rating}/>}
                                                        </td>
                                                        <td style={{padding: '12px 16px', textAlign: 'right'}}>
                                                            <button
                                                                className="dk-btn dk-ghost sm"
                                                                style={{fontSize: 11, height: 28}}
                                                                onClick={() => setEditingId(v.id)}
                                                                aria-label={`Edit ${v.name}`}
                                                            >
                                                                <IcEdit/> Edit
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </section>
                        );
                    })}
                </div>
            )}
        </AppShell>
    );
}
