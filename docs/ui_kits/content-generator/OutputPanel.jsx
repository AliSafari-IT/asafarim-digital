/* global React */

function OutputPanel({ output, busy, empty, onRegen }) {
  if (empty) {
    return (
      <section className="output empty">
        <div className="empty-state">
          <div className="empty-glyph">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" /></svg>
          </div>
          <h3 className="empty-title">Output appears here.</h3>
          <p className="empty-blurb">Pick a template, write a prompt, and hit <kbd className="kbd">⌘ ⏎</kbd> to generate.</p>
        </div>
      </section>
    );
  }
  return (
    <section className={"output" + (busy ? " busy" : "")}>
      <div className="output-head">
        <span className="eyebrow"><span className="dot" /> Output {busy && <span className="streaming">streaming…</span>}</span>
        <div className="output-actions">
          <button className="icon-btn" title="Regenerate" onClick={onRegen}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
          </button>
          <button className="icon-btn" title="Copy" onClick={() => navigator.clipboard?.writeText(output)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          </button>
          <button className="btn secondary sm">Save draft</button>
        </div>
      </div>

      <article className="output-card">
        <pre className="output-text">{output}{busy ? "▍" : ""}</pre>
      </article>

      {!busy && (
        <div className="output-meta">
          <span className="tag">claude-sonnet-4.5</span>
          <span className="meta-item">312 tokens</span>
          <span className="meta-divider" />
          <span className="meta-item">1.4s</span>
          <span className="meta-divider" />
          <span className="meta-item">$0.0021</span>
        </div>
      )}
    </section>
  );
}

window.OutputPanel = OutputPanel;
