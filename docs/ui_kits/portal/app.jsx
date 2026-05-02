/* global React, ReactDOM, Nav, Hero, CapabilityGrid, CaseStudyRail, ContactPanel, Footer */
const { useState, useEffect } = React;

function App() {
  const [route, setRoute] = useState("home");

  useEffect(() => {
    if (route === "contact") {
      const el = document.getElementById("contact");
      el && window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
    } else if (route === "capabilities") {
      const el = document.getElementById("capabilities");
      el && window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
    } else if (route === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [route]);

  return (
    <div className="portal">
      <Nav route={route} setRoute={setRoute} />
      <main>
        <Hero setRoute={setRoute} />
        <CapabilityGrid />
        <CaseStudyRail />
        <ContactPanel />
      </main>
      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
