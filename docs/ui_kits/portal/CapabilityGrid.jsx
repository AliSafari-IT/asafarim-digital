/* global React */

const CAPS = [
  {
    title: "Frontend Systems",
    grad: "linear-gradient(135deg,#3A7BFF,#6AA3FF)",
    blurb: "Design-forward product interfaces with structured information flow, polished interactions, and conversion-aware UX.",
    items: ["Next.js App Router", "Design systems", "Product landing pages", "Dashboard UX"],
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
  },
  {
    title: "Backend Platforms",
    grad: "linear-gradient(135deg,#36C6A8,#5DE4C7)",
    blurb: "Service boundaries, data modeling, secure auth flows, observability, and delivery patterns that hold up after launch.",
    items: ["TypeScript APIs", "C#/.NET services", "PostgreSQL", "Queues + automation"],
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5" /><path d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6" /></svg>,
  },
  {
    title: "Applied Intelligence",
    grad: "linear-gradient(135deg,#A78BFA,#F472B6)",
    blurb: "Production-focused agent flows, retrieval pipelines, and operational tooling that support real teams instead of demos.",
    items: ["RAG pipelines", "Tool-enabled agents", "Workflow orchestration", "Content automation"],
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" /></svg>,
  },
];

function CapabilityGrid() {
  return (
    <section className="caps" id="capabilities">
      <div className="section-head">
        <span className="eyebrow"><span className="dot" /> Capabilities</span>
        <h2 className="h2">Three pillars, one shipper.</h2>
        <p className="section-lead">Engagements compose across these. A typical build draws on all three — interface, platform, intelligence — by the same hand.</p>
      </div>
      <div className="caps-grid">
        {CAPS.map((c) => (
          <article className="cap-card" key={c.title}>
            <div className="cap-icon" style={{ background: c.grad }}>{c.icon}</div>
            <h3 className="cap-title">{c.title}</h3>
            <p className="cap-blurb">{c.blurb}</p>
            <ul className="cap-items">
              {c.items.map((it) => <li key={it}>{it}</li>)}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

window.CapabilityGrid = CapabilityGrid;
