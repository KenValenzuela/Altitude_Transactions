import {CONTACT_WORKFLOW_PREVIEW, ROLE_PERMISSIONS} from '@/lib/document-workflow';

export function AdminControlsSection() {
  const admin = ROLE_PERMISSIONS[0];
  const agent = ROLE_PERMISSIONS[1];

  return (
    <section className="lp-section lp-section--paper" aria-labelledby="admin-heading">
      <div className="lp-section-inner lp-split">
        <div>
          <p className="lp-section-eyebrow alt-eyebrow">Admin controls</p>
          <h2 id="admin-heading" className="lp-section-h2">Brett controls the templates. Agents work their own files.</h2>
          <p className="lp-section-copy">
            Brett/admin can add, delete, reorder, and globally edit contacts, vendor contacts, checklist rows, document categories, and custom transaction fields. Agents can upload documents, view permitted transaction information, and complete role-allowed actions without changing global templates.
          </p>
          <div className="lp-admin-actions" aria-label="Admin row controls preview">
            <button type="button">+ Add document row</button>
            <button type="button">Move row</button>
            <button type="button">Remove row</button>
            <button type="button">Reorder section</button>
          </div>
        </div>
        <div className="lp-permissions-card">
          <div className="lp-permission-grid">
            <div><strong>{admin.label}</strong><span>Approve extraction, deadline/contact updates, archive, add/move/delete rows.</span></div>
            <div><strong>{agent.label}</strong><span>Upload and view relevant files; no global delete, reorder, or approval rights.</span></div>
            <div><strong>System</strong><span>Suggests extracted values only. It may not finalize values without human approval.</span></div>
          </div>
          <div className="lp-contact-lines">
            {CONTACT_WORKFLOW_PREVIEW.map((contact) => (
              <div key={contact.id}>
                <strong>{contact.role}</strong>
                <span>{contact.company} · {contact.isCustom ? 'custom line' : 'admin template'}</span>
              </div>
            ))}
            <button type="button">+ Add contact / vendor line</button>
          </div>
        </div>
      </div>
    </section>
  );
}
