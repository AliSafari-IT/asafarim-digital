/* global React */
const { useState } = React;

function ContactPanel() {
  const [step, setStep] = useState("form"); // form | sent
  const [scope, setScope] = useState("Full-stack build");
  const scopes = ["Frontend Systems", "Backend Platforms", "Applied Intelligence", "Full-stack build"];

  if (step === "sent") {
    return (
      <section className="contact" id="contact">
        <div className="contact-card sent">
          <div className="check">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h2 className="h2">Message received.</h2>
          <p className="contact-lead">I'll write back within one working day, usually faster. In the meantime — feel free to forward existing PRDs, repos, or Figma links.</p>
          <button className="btn secondary" onClick={() => setStep("form")}>Send another</button>
        </div>
      </section>
    );
  }

  return (
    <section className="contact" id="contact">
      <div className="contact-card">
        <span className="eyebrow"><span className="dot" /> Start a project</span>
        <h2 className="h2">Tell me what you're building.</h2>
        <p className="contact-lead">A few sentences are enough. Existing repo, Figma link, or PRD welcome.</p>

        <div className="form-grid">
          <div className="field">
            <label>Name</label>
            <input defaultValue="Ali Safari" />
          </div>
          <div className="field">
            <label>Email</label>
            <input defaultValue="ali@asafarim.com" />
          </div>
          <div className="field full">
            <label>Scope</label>
            <div className="seg">
              {scopes.map((s) => (
                <button key={s} className={"seg-btn " + (scope === s ? "on" : "")} onClick={() => setScope(s)}>{s}</button>
              ))}
            </div>
          </div>
          <div className="field full">
            <label>Project</label>
            <textarea rows={4} defaultValue="We're building a B2B dashboard with a small AI assist layer — looking for someone who can own UI, API, and the retrieval pipeline end-to-end." />
          </div>
        </div>

        <div className="contact-actions">
          <span className="caption">Replies within one working day.</span>
          <button className="btn primary lg" onClick={() => setStep("sent")}>
            Send message
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}

window.ContactPanel = ContactPanel;
