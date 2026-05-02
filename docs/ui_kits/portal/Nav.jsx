/* global React */
const { useState } = React;

function Nav({ route, setRoute }) {
  const links = ["Capabilities", "Case studies", "Stack", "Contact"];
  return (
    <nav className="topnav">
      <div className="topnav-bar">
        <a className="brand" onClick={() => setRoute("home")}>
          <span className="brand-bug">A</span>
          <span className="brand-word"><span className="brand-accent">A</span>Safari<span className="brand-accent">M</span></span>
        </a>
        <div className="topnav-links">
          {links.map((l) => (
            <a key={l} className={route === l.toLowerCase().split(" ")[0] ? "on" : ""} onClick={() => setRoute(l.toLowerCase().split(" ")[0])}>{l}</a>
          ))}
        </div>
        <div className="topnav-actions">
          <button className="btn ghost">Sign in</button>
          <button className="btn primary" onClick={() => setRoute("contact")}>Start a project</button>
        </div>
      </div>
    </nav>
  );
}

window.Nav = Nav;
