import type { ExtractedField } from '@/types/domain';
export function EvidenceDrawer({field}:{field?:ExtractedField}){if(!field)return null;return <aside className="ops-card"><p className="eyebrow">Evidence</p><h3>{field.label}</h3><p>Source document {field.sourceDocumentId}, page {field.sourcePage}, {field.sourceSection}.</p></aside>}
