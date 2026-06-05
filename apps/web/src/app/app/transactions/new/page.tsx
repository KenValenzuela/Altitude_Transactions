import {PageHeader} from '@/components/product/ProductComponents';

export default function NewTransactionPage() {
  return <><PageHeader eyebrow="Upload New Contract" title="Create transaction draft from a contract PDF">Upload creates an intake review, shows extracted fields, seeds deadlines/checklist/contacts after Brett confirms, and writes an audit event.</PageHeader><section className="at-card at-upload"><h2>Contract PDF</h2><p>Drop a PDF here or choose a file. This Phase 1 UI keeps the human-in-the-loop flow explicit.</p><button>Choose PDF</button></section><section className="at-card"><h2>Review before creation</h2><ol><li>Extract property address, parties, contract date, closing date, and deadlines.</li><li>Brett reviews and confirms extracted fields.</li><li>Transaction file, deadlines, checklist, contacts, and audit history are seeded.</li></ol></section></>;
}
