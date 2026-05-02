/* global React */

function Hero({ setRoute }) {
  return (
    <section className="hero">
      <div className="hero-mesh" />
      <div className="hero-inner">
        <div className="eyebrow">
          <span className="dot" /> Frontend · Backend · AI
        </div>
        <h1 className="hero-h1">
          Ship <span className="grad">full-stack SaaS</span><br />
          that holds up <em>after</em> launch.
        </h1>
        <p className="hero-lead">
          Design-forward product interfaces, durable backend platforms, and applied-intelligence layers — built end-to-end by a single senior engineer. Capabilities, not packages.
        </p>
        <div className="hero-cta">
          <button className="btn primary lg" onClick={() => setRoute("contact")}>
            Start a project
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </button>
          <button className="btn secondary lg" onClick={() => setRoute("capabilities")}>Explore capabilities</button>
        </div>

        <div className="hero-stats">
          <div className="stat"><span className="v">12+</span><span className="l">Production ships</span></div>
          <div className="stat-divider" />
          <div className="stat"><span className="v">99.97%</span><span className="l">Uptime in prod</span></div>
          <div className="stat-divider" />
          <div className="stat"><span className="v">247ms</span><span className="l">p95 API latency</span></div>
        </div>
      </div>
    </section>
  );
}

window.Hero = Hero;
