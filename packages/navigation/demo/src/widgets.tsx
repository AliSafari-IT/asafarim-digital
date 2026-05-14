import { useEffect, useRef, useState } from "react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="demo-hero" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
      <span
        aria-hidden="true"
        style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          background: "linear-gradient(135deg,#2563eb,#7c3aed)",
          color: "white",
          fontWeight: 700,
          fontSize: 12,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        N
      </span>
      {!compact && <span>Navigation</span>}
    </span>
  );
}

/* Tiny theme toggle that flips data-theme on <html> */
export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    (document.documentElement.getAttribute("data-theme") as "light" | "dark") ?? "light"
  );
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  return (
    <button
      type="button"
      className="demo-btn"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title="Toggle theme"
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}

/* Demo "user avatar" → opens a dropdown trigger */
export function AvatarTrigger() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
      <span
        aria-hidden="true"
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "#7c3aed",
          color: "white",
          fontSize: 12,
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        A
      </span>
      <span style={{ fontSize: "0.875rem" }}>Ali ▾</span>
    </span>
  );
}

export function CodeBlock({ code }: { code: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="demo-code">
      <button
        type="button"
        className="demo-code-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="demo-code-chevron" data-open={open}>▶</span>
        {open ? "Hide code" : "Show code"}
      </button>
      {open && (
        <div className="demo-code-body">
          <button
            type="button"
            className="demo-code-copy"
            onClick={copy}
            aria-label="Copy code"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
          <pre className="demo-code-pre"><code>{code}</code></pre>
        </div>
      )}
    </div>
  );
}

export function NotificationBell() {
  return (
    <button
      type="button"
      className="demo-btn"
      aria-label="Notifications"
      style={{ position: "relative" }}
    >
      🔔
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -4,
          right: -4,
          background: "#dc2626",
          color: "white",
          fontSize: 10,
          fontWeight: 700,
          padding: "2px 5px",
          borderRadius: 999,
        }}
      >
        2
      </span>
    </button>
  );
}
