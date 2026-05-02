/* global React */
const { useState } = React;

const HISTORY = [
  { id: "1", title: "Launch email — meeting AI", time: "2m", active: true },
  { id: "2", title: "Landing copy — analytics SaaS", time: "1h" },
  { id: "3", title: "LinkedIn post on RAG", time: "yesterday" },
  { id: "4", title: "Onboarding sequence draft", time: "yesterday" },
  { id: "5", title: "Pricing FAQ rewrite", time: "Mon" },
  { id: "6", title: "Changelog summary v1.4", time: "Mon" },
];

function Sidebar({ onPick, activeId }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-bug">A</span>
        <div className="brand-stack">
          <span className="brand-word">ASafariM</span>
          <span className="brand-sub">Content Generator</span>
        </div>
      </div>

      <button className="new-chat">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        New generation
      </button>

      <div className="sidebar-search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input placeholder="Search history…" />
        <span className="kbd">⌘K</span>
      </div>

      <div className="sidebar-section">
        <span className="sidebar-h">Recent</span>
        <div className="history">
          {HISTORY.map((h) => (
            <button key={h.id} className={"history-item" + (h.id === activeId ? " on" : "")} onClick={() => onPick(h)}>
              <span className="history-title">{h.title}</span>
              <span className="history-time">{h.time}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-foot">
        <div className="usage-card">
          <div className="usage-row">
            <span className="usage-label">Tokens this month</span>
            <span className="usage-val">1.24M / 2M</span>
          </div>
          <div className="usage-bar"><div className="usage-fill" style={{ width: "62%" }} /></div>
          <button className="btn-link">Upgrade plan →</button>
        </div>
        <div className="profile">
          <div className="avatar">AS</div>
          <div className="profile-meta">
            <span className="profile-name">Ali Safari</span>
            <span className="profile-mail">ali@asafarim.com</span>
          </div>
          <button className="icon-btn" aria-label="settings">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

window.Sidebar = Sidebar;
