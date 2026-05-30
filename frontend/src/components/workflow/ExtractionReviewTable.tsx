import type { ExtractedField } from '@/types/domain';
import { ExtractedFieldRow } from './ExtractedFieldRow';

export function ExtractionReviewTable({
  fields,
  onApprove,
  onSelect,
  selectedFieldId,
}: {
  fields: ExtractedField[];
  onApprove?: (field: ExtractedField) => void;
  onSelect?: (field: ExtractedField) => void;
  selectedFieldId?: string;
}) {
  if (!fields.length) {
    return <p className="muted">No extracted fields are available for review.</p>;
  }

  return (
    <div className="table-scroll" role="region" aria-label="Extracted fields review table" tabIndex={0}>
      <table className="review-table">
        <caption>Review source-backed extracted contract fields before building the transaction workspace.</caption>
        <thead>
          <tr>
            <th scope="col">Field</th>
            <th scope="col">Value</th>
            <th scope="col">Confidence</th>
            <th scope="col">Evidence</th>
            <th scope="col">Population</th>
            <th scope="col">Review</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <ExtractedFieldRow
              field={field}
              key={field.id}
              onApprove={onApprove}
              onSelect={onSelect}
              selected={field.id === selectedFieldId}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
