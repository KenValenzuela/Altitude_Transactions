const PROBLEMS = [
  ['Missed deadline risk', 'Inspection, appraisal, title, loan, and closing dates shift when amendments change the contract.'],
  ['Scattered PDFs', 'Executed contracts, counterproposals, objections, resolutions, receipts, and addenda sit in separate inboxes and folders.'],
  ['Manual document tracking', 'Agents need to know what is needed, what is N/A, what is uploaded, and what Brett has approved.'],
  ['Compliance pressure', 'Broker review needs source-backed history before deadlines, contacts, and transaction status change.'],
] as const;

export function ProblemSection() {
  return (
    <section className="lp-section lp-section--paper" aria-labelledby="problem-heading">
      <div className="lp-section-inner">
        <div className="lp-section-header">
          <p className="lp-section-eyebrow alt-eyebrow">Why agents need this</p>
          <h2 id="problem-heading" className="lp-section-h2">Contract-to-close breaks down in operational details, not marketing pages.</h2>
        </div>
        <div className="lp-problem-grid">
          {PROBLEMS.map(([title, body]) => (
            <article key={title} className="lp-problem-card">
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
