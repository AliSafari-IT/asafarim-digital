/* global React */
const { useState } = React;

const TEMPLATES = [
  { id: "email", label: "Launch email", icon: "✉" },
  { id: "post", label: "Social post", icon: "◆" },
  { id: "landing", label: "Landing copy", icon: "▤" },
  { id: "blog", label: "Blog draft", icon: "❡" },
  { id: "summary", label: "Summary", icon: "≡" },
];

function Composer({ onGenerate, busy }) {
  const [prompt, setPrompt] = useState("Write a launch email for a new AI meeting assistant aimed at startup founders. Tone: confident but not salesy. CTA: book a 20-min demo.");
  const [tpl, setTpl] = useState("email");
  const [tone, setTone] = useState("Confident");
  const [length, setLength] = useState("Medium");

  return (
    <section className="composer">
      <div className="composer-head">
        <span className="eyebrow"><span className="dot" /> Prompt</span>
        <h2 className="composer-title">What should I draft?</h2>
      </div>

      <div className="template-row">
        {TEMPLATES.map((t) => (
          <button key={t.id} className={"tpl-chip" + (tpl === t.id ? " on" : "")} onClick={() => setTpl(t.id)}>
            <span className="tpl-glyph">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="prompt-card">
        <textarea
          className="prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          placeholder="Describe what you want, who it's for, and the tone…"
        />
        <div className="prompt-foot">
          <div className="prompt-controls">
            <div className="ctrl">
              <span className="ctrl-label">Tone</span>
              <div className="seg sm">
                {["Confident", "Friendly", "Technical"].map((t) => (
                  <button key={t} className={"seg-btn" + (tone === t ? " on" : "")} onClick={() => setTone(t)}>{t}</button>
                ))}
              </div>
            </div>
            <div className="ctrl">
              <span className="ctrl-label">Length</span>
              <div className="seg sm">
                {["Short", "Medium", "Long"].map((l) => (
                  <button key={l} className={"seg-btn" + (length === l ? " on" : "")} onClick={() => setLength(l)}>{l}</button>
                ))}
              </div>
            </div>
          </div>
          <button className="btn primary" disabled={busy} onClick={() => onGenerate({ prompt, tpl, tone, length })}>
            {busy ? "Generating…" : "Generate"}
            {!busy && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" /></svg>}
          </button>
        </div>
      </div>
    </section>
  );
}

window.Composer = Composer;
