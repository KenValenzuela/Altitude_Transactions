const WORKFLOW_STEPS = [
  'Upload executed contract or transaction document',
  'System extracts dates, deadlines, contacts, and document needs',
  'Brett/admin reviews source-backed suggestions',
  'Brett/admin approves updates',
  'Approved data updates the transaction workspace',
] as const;

export function WorkflowSteps() {
  return (
    <section id="workflow" className="lp-section lp-section--white" aria-labelledby="workflow-heading">
      <div className="lp-section-inner">
        <div className="lp-section-header">
          <p className="lp-section-eyebrow alt-eyebrow">Contract-to-close workflow</p>
          <h2 id="workflow-heading" className="lp-section-h2">From executed PDF to reviewed operational workspace.</h2>
        </div>
        <ol className="lp-workflow-rail">
          {WORKFLOW_STEPS.map((step, index) => (
            <li key={step} className="lp-workflow-step">
              <span>{index + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
