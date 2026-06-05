import Link from 'next/link';
import {PageHeader} from '@/components/product/ProductComponents';

export default function SettingsPage() {
  return <><PageHeader eyebrow="Settings" title="Admin configuration">Brett/admin can configure templates and deactivate historical rows without destroying transaction history. Agents cannot destroy admin templates or system-level configuration.</PageHeader><div className="at-grid-2"><Link className="at-card" href="/app/settings/document-templates"><h2>Document templates</h2><p>Checklist rows, required/optional defaults, ordering, custom rows, archive/deactivate.</p></Link><Link className="at-card" href="/app/settings/task-templates"><h2>Task templates</h2><p>Reusable task sets tied to transaction stages and deadlines.</p></Link><Link className="at-card" href="/app/settings/contact-types"><h2>Contact types</h2><p>Default contact roles plus custom contact rows.</p></Link></div></>;
}
