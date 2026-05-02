/* global React */

const CASES = [
  { tag: "Frontend", title: "Portal monorepo", blurb: "Next.js App Router build with shared design system across five surfaces.", stack: ["Next.js", "TypeScript", "pnpm"], grad: "linear-gradient(135deg,#3A7BFF22,#6AA3FF22)" },
  { tag: "Backend", title: "Document service", blurb: "C#/.NET API with Postgres + queue-driven workers for content ingestion.", stack: [".NET 8", "PostgreSQL", "Redis"], grad: "linear-gradient(135deg,#36C6A822,#5DE4C722)" },
  { tag: "AI", title: "Agent workflows", blurb: "Production retrieval pipeline + tool-enabled agent loops behind a typed API.", stack: ["RAG", "Tools", "Eval"], grad: "linear-gradient(135deg,#A78BFA22,#F472B622)" },
];

function CaseStudyRail() {
  return (
    <section className="cases">
      <div className="section-head row">
        <div>
          <span className="eyebrow"><span className="dot" /> Case studies</span>
          <h2 className="h2">Recent work.</h2>
        </div>
        <a className="link-arrow">View all
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
        </a>
      </div>
      <div className="case-rail">
        {CASES.map((c) => (
          <article className="case-card" key={c.title}>
            <div className="case-cover" style={{ background: c.grad }}>
              <span className="case-tag">{c.tag}</span>
            </div>
            <h3 className="case-title">{c.title}</h3>
            <p className="case-blurb">{c.blurb}</p>
            <div className="case-stack">
              {c.stack.map((s) => <span key={s} className="tag">{s}</span>)}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

window.CaseStudyRail = CaseStudyRail;
