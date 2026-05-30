import type { Contact } from '@/types/domain';
import { StatusBadge } from './StatusBadge';

export function ContactMatrix({ contacts }: { contacts: Contact[] }) {
  if (!contacts.length) {
    return <p className="muted">No parties or contacts have been extracted yet.</p>;
  }

  return (
    <div className="card-grid" role="list" aria-label="Transaction contacts">
      {contacts.map((contact) => (
        <article className="ops-card contact-card" key={contact.id} role="listitem">
          <p className="eyebrow">{contact.role.replaceAll('_', ' ')}</p>
          <h3>{contact.name || contact.company || 'Missing contact'}</h3>
          <dl>
            <div>
              <dt>Email</dt>
              <dd>{contact.email || 'Needed'}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{contact.phone || 'Needed'}</dd>
            </div>
          </dl>
          <StatusBadge label={contact.complete ? 'Complete' : contact.required ? 'Needs review' : 'Optional'} tone={contact.complete ? 'success' : 'warning'} />
        </article>
      ))}
    </div>
  );
}
