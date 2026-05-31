import type { ExtractionJob } from '@/types/domain';

export function ExtractionProgress({ job }: { job?: ExtractionJob }) {
  const percent = job?.progressPercent ?? 35;
  const status = job?.status?.replaceAll('_', ' ') ?? 'parsing pdf';

  return (
    <section className="ops-card extraction-progress" aria-labelledby="extraction-progress-title">
      <p className="eyebrow">Extraction progress</p>
      <h2 id="extraction-progress-title">{status}</h2>
      <progress value={percent} max={100} aria-label={`Extraction is ${percent}% complete`} />
      <p className="muted">Fields, deadlines, and parties are extracted from your contract PDF. Each value is held for your review before it becomes part of the transaction record.</p>
    </section>
  );
}
