/* global React */

function Footer() {
  const cols = [
    { h: "Capabilities", links: ["Frontend Systems", "Backend Platforms", "Applied Intelligence"] },
    { h: "Work", links: ["Case studies", "Open source", "Writing"] },
    { h: "Contact", links: ["ali@asafarim.com", "GitHub", "LinkedIn"] },
  ];
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="brand">
            <span className="brand-bug">A</span>
            <span className="brand-word"><span className="brand-accent">A</span>Safari<span className="brand-accent">M</span></span>
          </div>
          <p className="footer-tag">Frontend systems · Backend platforms · Applied intelligence — by a single senior engineer.</p>
        </div>
        {cols.map((c) => (
          <div className="footer-col" key={c.h}>
            <span className="footer-h">{c.h}</span>
            {c.links.map((l) => <a key={l}>{l}</a>)}
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <span>© 2025 ASafariM · Portal · Monorepo</span>
        <span className="footer-meta">v1.4.0 · Built with Next.js</span>
      </div>
    </footer>
  );
}

window.Footer = Footer;
