import {PageHeader} from '@/components/product/ProductComponents';

export default function TaskTemplatesPage() {
  return <><PageHeader eyebrow="Admin · Task Templates" title="Reusable task templates">Task templates can be added, edited, deactivated, reordered, and applied to transactions without removing historical completed tasks.</PageHeader><div className="at-grid-2"><article className="at-card"><h2>Contract intake</h2><p>Review extraction, confirm contacts, seed deadlines, verify required checklist rows.</p></article><article className="at-card"><h2>Inspection period</h2><p>Track objection, resolution, contractor invoices, repair receipts, and related audit events.</p></article></div></>;
}
