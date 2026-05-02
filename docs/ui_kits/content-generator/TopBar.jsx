/* global React */

function TopBar({ model, setModel }) {
  const models = ["claude-sonnet-4.5", "gpt-4.1", "asafarim-rag-v2"];
  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="crumbs">
          <span>Workspace</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
          <span>Marketing</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
          <span className="cur">Launch email — meeting AI</span>
        </span>
      </div>
      <div className="topbar-right">
        <div className="model-picker">
          <span className="model-label">Model</span>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            {models.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <button className="icon-btn" title="Share">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
        </button>
        <button className="icon-btn" title="History">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
        </button>
      </div>
    </header>
  );
}

window.TopBar = TopBar;
