'use client';

import {useState} from 'react';
import {api} from '@/lib/api-client';
import type {Contact} from '@/types/domain';
import {StatusBadge} from './StatusBadge';

// ── Role display labels ───────────────────────────────────────
const ROLE_LABELS: Record<string, string> = {
    buyer: 'Buyer',
    seller: 'Seller',
    listing_agent: "Listing Agent",
    buyers_agent: "Buyer's Agent",
    buyer_agent: "Buyer's Agent",
    selling_agent: 'Selling Agent',
    lender: 'Lender',
    title: 'Title & Escrow',
    inspector: 'Inspector',
    attorney: 'Attorney',
    co_buyer: 'Co-Buyer',
    co_seller: 'Co-Seller',
    vendor: 'Vendor',
    other: 'Other',
};

function roleLabel(role: string): string {
    return (
        ROLE_LABELS[role.toLowerCase()] ??
        role.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    );
}

// ── Icons ─────────────────────────────────────────────────────
function IcPhone() {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path
            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.4 19.79 19.79 0 0 1 1.64 4.72 2 2 0 0 1 3.61 2.5h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 17z"/>
    </svg>;
}

function IcMail() {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
    </svg>;
}

function IcBuilding() {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="7" width="10" height="17"/>
        <path d="M12 7V4H2v3"/>
        <path d="M22 22h-8v-9h8z"/>
        <path d="M18 13h2"/>
        <path d="M18 17h2"/>
    </svg>;
}

function IcEdit() {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>;
}

// ── Edit draft type ───────────────────────────────────────────
interface Draft {
    name: string;
    company: string;
    email: string;
    phone: string;
    notes: string;
}

function draftFromContact(c: Contact): Draft {
    return {
        name: c.name ?? '',
        company: c.company ?? '',
        email: c.email ?? '',
        phone: c.phone ?? '',
        notes: c.notes ?? '',
    };
}

// ── Single contact card ───────────────────────────────────────
function ContactCard({
                         contact,
                         onUpdate,
                     }: {
    contact: Contact;
    onUpdate: (updated: Contact) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [draft, setDraft] = useState<Draft>(() => draftFromContact(contact));

    function startEdit() {
        setDraft(draftFromContact(contact));
        setError('');
        setSuccess('');
        setEditing(true);
    }

    function cancelEdit() {
        setEditing(false);
        setError('');
    }

    async function saveEdit() {
        setSaving(true);
        setError('');
        try {
            const updated = await api.updateContact(contact.id, {
                name: draft.name || undefined,
                company: draft.company || undefined,
                email: draft.email || undefined,
                phone: draft.phone || undefined,
                notes: draft.notes || undefined,
            });
            onUpdate(updated);
            setEditing(false);
            setSuccess('Changes saved.');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    const displayName = contact.name || contact.company || 'Missing contact';
    const showCompany = contact.company && contact.name;

    return (
        <article
            className={`dk-contact-card${editing ? ' dk-contact-card--editing' : ''}`}
            aria-label={`${roleLabel(contact.role)}: ${displayName}`}
            role="listitem"
        >
            {/* Header */}
            <div className="dk-contact-card-head">
                <div className="dk-contact-card-role">{roleLabel(contact.role)}</div>
                <div className="dk-contact-card-name">{displayName}</div>
                {showCompany && <div className="dk-contact-card-company">{contact.company}</div>}
            </div>

            {/* Edit form */}
            {editing ? (
                <div className="dk-contact-edit">
                    <div className="dk-contact-edit-row">
                        <div className="dk-contact-edit-field">
                            <label className="dk-contact-edit-label" htmlFor={`cn-name-${contact.id}`}>
                                Full Name
                            </label>
                            <input
                                id={`cn-name-${contact.id}`}
                                className="dk-contact-edit-input"
                                value={draft.name}
                                onChange={(e) => setDraft((p) => ({...p, name: e.target.value}))}
                                placeholder="Full name"
                                autoFocus
                            />
                        </div>
                        <div className="dk-contact-edit-field">
                            <label className="dk-contact-edit-label" htmlFor={`cn-company-${contact.id}`}>
                                Company
                            </label>
                            <input
                                id={`cn-company-${contact.id}`}
                                className="dk-contact-edit-input"
                                value={draft.company}
                                onChange={(e) => setDraft((p) => ({...p, company: e.target.value}))}
                                placeholder="Company name"
                            />
                        </div>
                    </div>
                    <div className="dk-contact-edit-row">
                        <div className="dk-contact-edit-field">
                            <label className="dk-contact-edit-label" htmlFor={`cn-email-${contact.id}`}>
                                Email
                            </label>
                            <input
                                id={`cn-email-${contact.id}`}
                                type="email"
                                className="dk-contact-edit-input"
                                value={draft.email}
                                onChange={(e) => setDraft((p) => ({...p, email: e.target.value}))}
                                placeholder="email@example.com"
                            />
                        </div>
                        <div className="dk-contact-edit-field">
                            <label className="dk-contact-edit-label" htmlFor={`cn-phone-${contact.id}`}>
                                Phone
                            </label>
                            <input
                                id={`cn-phone-${contact.id}`}
                                type="tel"
                                className="dk-contact-edit-input"
                                value={draft.phone}
                                onChange={(e) => setDraft((p) => ({...p, phone: e.target.value}))}
                                placeholder="(303) 555-0100"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="dk-contact-edit-error" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="dk-contact-edit-actions">
                        <button
                            className="dk-btn dk-primary sm"
                            onClick={() => void saveEdit()}
                            disabled={saving}
                            aria-busy={saving}
                        >
                            {saving ? 'Saving…' : 'Save changes'}
                        </button>
                        <button className="dk-btn dk-secondary sm" onClick={cancelEdit} disabled={saving}>
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                /* Read view */
                <div className="dk-contact-card-body">
                    <div className="dk-contact-item">
                        <span className="dk-contact-item-icon"><IcPhone/></span>
                        {contact.phone
                            ? <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                            : <span className="missing">No phone on file</span>}
                    </div>
                    <div className="dk-contact-item">
                        <span className="dk-contact-item-icon"><IcMail/></span>
                        {contact.email
                            ? <a href={`mailto:${contact.email}`}>{contact.email}</a>
                            : <span className="missing">No email on file</span>}
                    </div>
                    {showCompany && (
                        <div className="dk-contact-item">
                            <span className="dk-contact-item-icon"><IcBuilding/></span>
                            <span style={{color: 'var(--fg2)'}}>{contact.company}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="dk-contact-card-foot">
                {success
                    ? <span className="dk-contact-edit-success">{success}</span>
                    : (
                        <StatusBadge
                            label={contact.complete ? 'Complete' : contact.required ? 'Needs review' : 'Optional'}
                            tone={contact.complete ? 'success' : 'warning'}
                        />
                    )
                }
                {!editing && (
                    <button
                        className="dk-btn dk-ghost sm"
                        onClick={startEdit}
                        aria-label={`Edit ${roleLabel(contact.role)} contact`}
                    >
                        <IcEdit/> Edit
                    </button>
                )}
            </div>
        </article>
    );
}

// ── Exported component ────────────────────────────────────────
export function ContactMatrix({contacts: initialContacts}: { contacts: Contact[] }) {
    const [contacts, setContacts] = useState(initialContacts);

  if (!contacts.length) {
      return (
          <div className="empty-state">
              <p className="body-sm muted">No parties or contacts have been extracted yet.</p>
          </div>
      );
  }

    function handleUpdate(updated: Contact) {
        setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  return (
    <div className="card-grid" role="list" aria-label="Transaction contacts">
      {contacts.map((contact) => (
          <ContactCard key={contact.id} contact={contact} onUpdate={handleUpdate}/>
      ))}
    </div>
  );
}
