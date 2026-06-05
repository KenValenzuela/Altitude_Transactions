import {documentTemplates, userPermissions} from '@/lib/product-data';
import {PageHeader} from '@/components/product/ProductComponents';

export default function DocumentTemplatesPage() {
  return <><PageHeader eyebrow="Admin · Document Templates" title="Configurable document checklist rows">Rows support add, edit, deactivate, reorder, required/optional defaults, apply to transaction, and archive from template without destroying history.</PageHeader><section className="at-card"><h2>Permission guard</h2><p>{userPermissions.admin.label} can configure and delete/deactivate templates. {userPermissions.agent.label} cannot destroy admin templates.</p></section><div className="at-table-card">{documentTemplates.map((template, index) => <div className="at-table-row at-template-grid" key={template}><strong>{index + 1}. {template}</strong><span>{index < 10 ? 'Required default available' : 'Custom row supported'}</span><div className="at-row-actions"><button>Edit</button><button>Deactivate</button><button>Reorder</button></div></div>)}</div></>;
}
