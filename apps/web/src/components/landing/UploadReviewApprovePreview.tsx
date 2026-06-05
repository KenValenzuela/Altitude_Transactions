const STATE_MODEL = ['Needed', 'N/A', 'Uploaded', 'Ready for Review', 'Reviewed', 'Approved', 'Superseded'] as const;

const BUTTON_RULES = [
  ['Needed + missing', 'Upload Needed Document'],
  ['Uploaded, not reviewed', 'Review'],
  ['Reviewed', 'Approve'],
  ['Approved', 'Mark complete + update dependent records'],
  ['N/A', 'Exclude from completion and client-facing noise'],
] as const;

export function UploadReviewApprovePreview() {
  return (
    <section className="lp-section lp-section--white" aria-labelledby="state-heading">
      <div className="lp-section-inner lp-split lp-split--reverse">
        <div className="lp-state-card">
          <h3>Document row behavior</h3>
          <div className="lp-state-row lp-state-row--missing"><span>Inspection Resolution</span><button>Upload Needed Document</button></div>
          <div className="lp-state-row lp-state-row--uploaded"><span>Earnest Money Receipt</span><button>Review</button></div>
          <div className="lp-state-row lp-state-row--reviewed"><span>Amend / Extend #2</span><button>Approve</button></div>
          <div className="lp-state-row lp-state-row--approved"><span>Contract to Buy and Sell</span><strong>Approved</strong></div>
          <div className="lp-state-row lp-state-row--na"><span>Counterproposal</span><strong>N/A</strong></div>
          <div className="lp-needed-control-note">Right side controls: <b>Needed</b> / <b>N/A</b></div>
        </div>
        <div>
          <p className="lp-section-eyebrow alt-eyebrow">Upload / review / approve</p>
          <h2 id="state-heading" className="lp-section-h2">The dominant workflow is a human-approved state machine.</h2>
          <div className="lp-state-pills" aria-label="Document workflow states">
            {STATE_MODEL.map((state) => <span key={state}>{state}</span>)}
          </div>
          <ul className="lp-rule-list">
            {BUTTON_RULES.map(([state, action]) => (
              <li key={state}><strong>{state}:</strong> {action}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
