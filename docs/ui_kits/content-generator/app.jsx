/* global React, ReactDOM, Sidebar, TopBar, Composer, OutputPanel */
const { useState, useRef } = React;

const SAMPLE = `Subject: Stop taking meeting notes. (Seriously.)

Hi {first_name},

Most founders I talk to spend 4–6 hours a week writing up calls. That's a full workday — gone.

We just shipped Recap. It joins your Zoom or Meet sessions, captures what was actually decided, and posts a clean summary to Slack within 90 seconds. No bots in the recording. No 40-page transcript dumps.

Three things we hear most from early teams:

  • "It catches the action items I would've missed."
  • "It feels like a quiet co-founder, not another tool."
  • "Setup took two minutes."

If that sounds useful, grab a 20-minute slot here — I'll show you the pipeline behind it and answer real questions.

→ asafarim.com/recap-demo

— Ali`;

function App() {
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [empty, setEmpty] = useState(true);
  const [model, setModel] = useState("claude-sonnet-4.5");
  const [activeId, setActiveId] = useState("1");
  const tickRef = useRef(null);

  const stream = (text) => {
    setEmpty(false);
    setBusy(true);
    setOutput("");
    let i = 0;
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      i += Math.max(2, Math.floor(Math.random() * 6));
      if (i >= text.length) {
        i = text.length;
        clearInterval(tickRef.current);
        setBusy(false);
      }
      setOutput(text.slice(0, i));
    }, 22);
  };

  const generate = () => stream(SAMPLE);
  const regen = () => stream(SAMPLE);
  const pickHistory = (h) => { setActiveId(h.id); setEmpty(false); setOutput(SAMPLE); setBusy(false); };

  return (
    <div className="cg-app">
      <Sidebar activeId={activeId} onPick={pickHistory} />
      <div className="cg-main">
        <TopBar model={model} setModel={setModel} />
        <div className="cg-body">
          <Composer onGenerate={generate} busy={busy} />
          <OutputPanel output={output} busy={busy} empty={empty} onRegen={regen} />
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
