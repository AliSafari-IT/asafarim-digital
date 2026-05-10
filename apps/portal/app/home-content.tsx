"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { SiteFooter, SiteHeader } from "@/components/site-shell";

/* ─── Types ─────────────────────────────────────────────────────────────────
   Keep API-compatible with page.tsx which passes `content` from the CMS DB.
   We render fully from hardcoded defaults — great even when the table is empty.
──────────────────────────────────────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ContentMap = Record<string, unknown>;

/* ─── Keyframes ─────────────────────────────────────────────────────────── */

const KF = `
@keyframes asm-float {
  0%,100% { transform: translateY(0px);   }
  50%      { transform: translateY(-14px); }
}
@keyframes asm-glow {
  0%,100% {
    filter: drop-shadow(0 0 20px rgba(76,125,255,0.52))
            drop-shadow(0 0 56px rgba(93,228,199,0.22));
  }
  50% {
    filter: drop-shadow(0 0 38px rgba(76,125,255,0.85))
            drop-shadow(0 0 90px rgba(93,228,199,0.40));
  }
}
@keyframes asm-spin-fwd { to { transform: rotate( 360deg); } }
@keyframes asm-spin-rev { to { transform: rotate(-360deg); } }
@keyframes asm-shimmer {
  from { background-position: -200% center; }
  to   { background-position:  200% center; }
}
@keyframes asm-orb-a {
  0%,100% { transform: translate(  0px,  0px); }
  38%     { transform: translate( 50px,-32px); }
  72%     { transform: translate(-22px, 20px); }
}
@keyframes asm-orb-b {
  0%,100% { transform: translate(  0px,  0px); }
  44%     { transform: translate(-58px, 24px); }
  74%     { transform: translate( 28px,-17px); }
}
@keyframes asm-orb-c {
  0%,100% { transform: translate(  0px,  0px); }
  34%     { transform: translate( 28px, 38px); }
  68%     { transform: translate(-18px,-28px); }
}
`;

/* ─── Hero logo: 6-app constellation around the ASM triangle ─────────────
   Outer hexagon (pointy-top, r=76 from centre 110,110):
     0 Portal          (110,  34) — azure
     1 ContentGen      (176,  72) — violet
     2 OpsHub          (176, 148) — mint
     3 EduMatch        (110, 186) — amber
     4 MarketingCon    ( 44, 148) — pink
     5 Vionto          ( 44,  72) — coral
   Inner triangle (scaled from logo-mark.svg):
     top (110,74)  violet/AI
     BL  ( 88,112) azure/Frontend
     BR  (132,112) mint/Backend
─────────────────────────────────────────────────────────────────────────── */

const OUTER_NODES = [
  { cx: 110, cy:  34, g: "lp-az", name: "Portal"            },
  { cx: 176, cy:  72, g: "lp-vi", name: "Content Generator" },
  { cx: 176, cy: 148, g: "lp-mn", name: "Ops Hub"           },
  { cx: 110, cy: 186, g: "lp-am", name: "EduMatch"          },
  { cx:  44, cy: 148, g: "lp-pk", name: "Marketing"         },
  { cx:  44, cy:  72, g: "lp-co", name: "Vionto"            },
] as const;

const INNER_NODES = [
  { cx: 110, cy:  74, g: "lp-c-ai" },
  { cx:  88, cy: 112, g: "lp-c-fe" },
  { cx: 132, cy: 112, g: "lp-c-be" },
] as const;

function AsmHeroMark() {
  return (
    <svg
      viewBox="0 0 220 220"
      fill="none"
      width="230"
      height="230"
      role="img"
      aria-label="ASafariM Digital — six-app platform constellation"
      style={{
        animation: "asm-float 4.6s ease-in-out infinite, asm-glow 3.4s ease-in-out infinite",
        willChange: "transform, filter",
      }}
    >
      <defs>
        {/* Outer-node gradients */}
        <linearGradient id="lp-az" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#4c7dff" /><stop offset="100%" stopColor="#6aa3ff" />
        </linearGradient>
        <linearGradient id="lp-vi" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#c084fc" /><stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
        <linearGradient id="lp-mn" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#5de4c7" /><stop offset="100%" stopColor="#36c6a8" />
        </linearGradient>
        <linearGradient id="lp-am" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#fbbf24" /><stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="lp-pk" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#f472b6" /><stop offset="100%" stopColor="#fb7185" />
        </linearGradient>
        <linearGradient id="lp-co" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#f36f56" /><stop offset="100%" stopColor="#e8b45d" />
        </linearGradient>
        {/* Inner-node gradients */}
        <linearGradient id="lp-c-ai" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#c084fc" /><stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
        <linearGradient id="lp-c-fe" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#4c7dff" /><stop offset="100%" stopColor="#6aa3ff" />
        </linearGradient>
        <linearGradient id="lp-c-be" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#5de4c7" /><stop offset="100%" stopColor="#36c6a8" />
        </linearGradient>
        {/* Radial halo */}
        <radialGradient id="lp-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#4c7dff" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#4c7dff" stopOpacity="0"   />
        </radialGradient>
        {/* Glow filters */}
        <filter id="lp-f1" x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur stdDeviation="3"  result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="lp-f2" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6"  result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background halo */}
      <circle cx="110" cy="110" r="108" fill="url(#lp-halo)" />

      {/* Outer spinning dashed orbit */}
      <g style={{ transformOrigin: "110px 110px", animation: "asm-spin-fwd 32s linear infinite" }}>
        <circle cx="110" cy="110" r="92"
          stroke="rgba(76,125,255,0.18)" strokeWidth="0.8" strokeDasharray="5 9" />
      </g>
      {/* Inner counter-spinning orbit */}
      <g style={{ transformOrigin: "110px 110px", animation: "asm-spin-rev 22s linear infinite" }}>
        <circle cx="110" cy="110" r="56"
          stroke="rgba(93,228,199,0.14)" strokeWidth="0.6" strokeDasharray="3 11" />
      </g>

      {/* Spoke lines from centre to each outer node */}
      {OUTER_NODES.map((n) => (
        <line key={`sp-${n.name}`}
          x1="110" y1="110" x2={n.cx} y2={n.cy}
          stroke={`url(#${n.g})`} strokeWidth="0.8" strokeOpacity="0.3"
        />
      ))}

      {/* Hexagon outline connecting outer nodes */}
      <polygon
        points={OUTER_NODES.map((n) => `${n.cx},${n.cy}`).join(" ")}
        stroke="rgba(76,125,255,0.13)" strokeWidth="0.7" fill="none"
      />

      {/* Outer app nodes */}
      {OUTER_NODES.map((n) => (
        <g key={`on-${n.name}`} filter="url(#lp-f1)">
          <circle cx={n.cx} cy={n.cy} r="20" fill={`url(#${n.g})`} opacity="0.13" />
          <circle cx={n.cx} cy={n.cy} r="13" fill={`url(#${n.g})`} />
          <circle cx={n.cx} cy={n.cy} r="3.8" fill="white" opacity="0.93" />
        </g>
      ))}

      {/* Inner triangle edges */}
      <line x1="110" y1=" 74" x2=" 88" y2="112" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" />
      <line x1="110" y1=" 74" x2="132" y2="112" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" />
      <line x1=" 88" y1="112" x2="132" y2="112" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" />

      {/* Inner triangle nodes (AI / Frontend / Backend) */}
      {INNER_NODES.map((n) => (
        <g key={`in-${n.g}`} filter="url(#lp-f2)">
          <circle cx={n.cx} cy={n.cy} r="10" fill={`url(#${n.g})`} />
          <circle cx={n.cx} cy={n.cy} r="3"  fill="white" opacity="0.95" />
        </g>
      ))}
    </svg>
  );
}

/* ─── Scroll-reveal wrapper ─────────────────────────────────────────────── */

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(28px)";
    el.style.transition = `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.style.opacity = "1";
        el.style.transform = "none";
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return <div ref={ref}>{children}</div>;
}

/* ─── Tiny shared UI pieces ─────────────────────────────────────────────── */

function Eyebrow({ children, color = "var(--color-text-muted)" }: { children: ReactNode; color?: string }) {
  return (
    <p style={{ fontSize: "0.67rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color, marginBottom: "16px" }}>
      {children}
    </p>
  );
}

function SectionH2({ children }: { children: ReactNode }) {
  return (
    <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 14px", color: "var(--color-text)" }}>
      {children}
    </h2>
  );
}

function Sub({ children, maxWidth = 520 }: { children: ReactNode; maxWidth?: number }) {
  return (
    <p style={{ color: "var(--color-text-muted)", maxWidth, lineHeight: 1.72, fontSize: "0.97rem", margin: 0 }}>
      {children}
    </p>
  );
}

function GradText({ children }: { children: ReactNode }) {
  return (
    <span style={{ background: "linear-gradient(120deg,#6aa3ff 0%,#a78bfa 50%,#5de4c7 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" }}>
      {children}
    </span>
  );
}

function HoverAnchor({
  href, primary = false, children, external = false,
}: { href: string; primary?: boolean; children: ReactNode; external?: boolean }) {
  const base: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: "8px",
    fontWeight: primary ? 700 : 600, fontSize: "0.9rem",
    padding: "14px 28px", borderRadius: "100px",
    textDecoration: "none",
    transition: "opacity 0.2s, transform 0.2s, box-shadow 0.2s",
    ...(primary
      ? { background: "var(--color-primary)", color: "white", boxShadow: "0 8px 28px rgba(76,125,255,0.4)" }
      : { background: "var(--color-panel-strong)", border: "1px solid var(--color-border-strong)", color: "var(--color-text)" }),
  };
  return (
    <a href={href} style={base}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.opacity = "0.88"; el.style.transform = "translateY(-2px)";
        if (primary) el.style.boxShadow = "0 16px 44px rgba(76,125,255,0.52)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.opacity = "1"; el.style.transform = "none";
        if (primary) el.style.boxShadow = "0 8px 28px rgba(76,125,255,0.4)";
      }}
    >
      {children}
    </a>
  );
}

/* ─── App card ──────────────────────────────────────────────────────────── */

interface AppDef {
  name: string; tagline: string; desc: string;
  href: string; port: number;
  gradient: string; glow: string; live: boolean;
  icon: ReactNode;
}

function AppCard({ app }: { app: AppDef }) {
  return (
    <a href={app.href} style={{
      display: "flex", flexDirection: "column",
      borderRadius: "24px", border: "1px solid var(--color-border)",
      background: "var(--color-panel)", overflow: "hidden",
      textDecoration: "none", color: "inherit",
      transition: "border-color 0.22s, transform 0.22s, box-shadow 0.22s",
    }}
      onMouseEnter={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = "translateY(-5px)"; el.style.borderColor = "var(--color-border-strong)"; el.style.boxShadow = `0 24px 60px -20px ${app.glow}`; }}
      onMouseLeave={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = "none"; el.style.borderColor = "var(--color-border)"; el.style.boxShadow = "none"; }}
    >
      {/* Banner */}
      <div style={{ background: "linear-gradient(135deg,#0b1324,#10203f)", padding: "20px 22px 16px", borderBottom: "1px solid var(--color-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: app.gradient, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {app.icon}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
            <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "3px 10px", borderRadius: "100px", background: app.live ? "rgba(79,242,201,0.12)" : "rgba(255,255,255,0.07)", color: app.live ? "#4ff2c9" : "#9fb0cf", border: app.live ? "1px solid rgba(79,242,201,0.28)" : "1px solid rgba(255,255,255,0.1)" }}>
              {app.live ? "Live" : "Dev"}
            </span>
            <span style={{ fontFamily: "var(--font-mono,monospace)", fontSize: "0.58rem", color: "rgba(159,176,207,0.45)" }}>:{app.port}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "5px" }}>
          <div style={{ height: "5px", flex: 2, borderRadius: "3px", background: app.gradient, opacity: 0.65 }} />
          <div style={{ height: "5px", flex: 1, borderRadius: "3px", background: "rgba(255,255,255,0.07)" }} />
          <div style={{ height: "5px", flex: 1, borderRadius: "3px", background: "rgba(255,255,255,0.04)" }} />
        </div>
      </div>
      {/* Body */}
      <div style={{ padding: "20px 22px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
        <p style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "5px" }}>{app.tagline}</p>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, letterSpacing: "-0.025em", color: "var(--color-text)", margin: "0 0 9px" }}>{app.name}</h3>
        <p style={{ fontSize: "0.83rem", lineHeight: 1.67, color: "var(--color-text-muted)", margin: "0 0 18px", flex: 1 }}>{app.desc}</p>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem", fontWeight: 600, color: "var(--color-primary)" }}>
          Open app <span aria-hidden="true">→</span>
        </div>
      </div>
    </a>
  );
}

/* ─── Capability pillar ─────────────────────────────────────────────────── */

function Pillar({ title, tag, desc, items, gradient, icon }: {
  title: string; tag: string; desc: string;
  items: string[]; gradient: string; icon: ReactNode;
}) {
  return (
    <article style={{ borderRadius: "24px", border: "1px solid var(--color-border-strong)", background: "var(--color-panel-strong)", padding: "28px", transition: "transform 0.22s" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "none"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
        <span style={{ width: "44px", height: "44px", borderRadius: "14px", background: gradient, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</span>
        <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>{tag}</span>
      </div>
      <h3 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 10px", color: "var(--color-text)" }}>{title}</h3>
      <p style={{ fontSize: "0.875rem", lineHeight: 1.65, color: "var(--color-text-muted)", margin: "0 0 20px" }}>{desc}</p>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexWrap: "wrap", gap: "7px" }}>
        {items.map((it) => (
          <li key={it} style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--color-text-muted)", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "100px", padding: "4px 12px" }}>{it}</li>
        ))}
      </ul>
    </article>
  );
}

/* ─── Stack group card ──────────────────────────────────────────────────── */

function StackGroup({ title, color, items }: { title: string; color: string; items: string[] }) {
  return (
    <article style={{ borderRadius: "20px", border: "1px solid var(--color-border)", background: "var(--color-panel)", padding: "22px" }}>
      <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 14px", color: "var(--color-text)", display: "flex", alignItems: "center", gap: "9px" }}>
        <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
        {title}
      </h3>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "7px" }}>
        {items.map((it) => (
          <li key={it} style={{ fontSize: "0.83rem", color: "var(--color-text-muted)", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "10px", padding: "9px 14px" }}>{it}</li>
        ))}
      </ul>
    </article>
  );
}

/* ─── Static data ───────────────────────────────────────────────────────── */

const APPS: AppDef[] = [
  {
    name: "Portal", tagline: "Identity & Hub", port: 3000, live: true,
    desc: "Shared authentication, full SSO across all apps, user management, role-based access control, and the central launch pad for the ASafariM platform.",
    href: "http://localhost:3000",
    gradient: "linear-gradient(135deg,#4c7dff,#6aa3ff)", glow: "rgba(76,125,255,0.42)",
    icon: <svg viewBox="0 0 24 24" fill="none" width="22" height="22" aria-hidden="true"><path d="M12 3C8.5 3 5.5 4.8 4 7.5M12 3c3.5 0 6.5 1.8 8 4.5M12 3v4M4 7.5C3.4 8.7 3 10 3 12c0 1.9.5 3.7 1.5 5.2M4 7.5l3.5 2M20 7.5C20.6 8.7 21 10 21 12c0 1.9-.5 3.7-1.5 5.2M20 7.5l-3.5 2M5.5 17.2A9 9 0 0 0 12 21a9 9 0 0 0 6.5-3.8M5.5 17.2l3.5-2M18.5 17.2l-3.5-2M12 17v4M9 12a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  },
  {
    name: "Content Generator", tagline: "AI Writing Workspace", port: 3001, live: true,
    desc: "AI-assisted content for blog posts, product copy, email campaigns, and social — powered by OpenAI GPT-4 with an Anthropic Claude fallback and streaming support.",
    href: "http://localhost:3001",
    gradient: "linear-gradient(135deg,#c084fc,#f472b6)", glow: "rgba(192,132,252,0.42)",
    icon: <svg viewBox="0 0 24 24" fill="none" width="22" height="22" aria-hidden="true"><path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  },
  {
    name: "Ops Hub", tagline: "SaaS Operations Console", port: 3003, live: true,
    desc: "Internal operator console for managing tenants, subscriptions, feature flags, usage metrics, lifecycle states, automations, and audit history with RBAC.",
    href: "http://localhost:3003",
    gradient: "linear-gradient(135deg,#5de4c7,#36c6a8)", glow: "rgba(93,228,199,0.42)",
    icon: <svg viewBox="0 0 24 24" fill="none" width="22" height="22" aria-hidden="true"><ellipse cx="12" cy="5.5" rx="7" ry="2.5" stroke="white" strokeWidth="1.5" /><path d="M5 5.5v6c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5v-6" stroke="white" strokeWidth="1.5" /><path d="M5 11.5v6c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5v-6" stroke="white" strokeWidth="1.5" /></svg>,
  },
  {
    name: "Marketing Content", tagline: "Growth Engine", port: 3004, live: true,
    desc: "Campaign management, content calendar, SEO tracking, lead capture, marketing automations, and analytics — all in one growth operations workspace.",
    href: "http://localhost:3004",
    gradient: "linear-gradient(135deg,#f472b6,#fb7185)", glow: "rgba(244,114,182,0.42)",
    icon: <svg viewBox="0 0 24 24" fill="none" width="22" height="22" aria-hidden="true"><path d="M3 17l4-8 4 4 3-6 4 5.5 3-2" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 20h18" stroke="white" strokeWidth="1.4" strokeLinecap="round" /></svg>,
  },
  {
    name: "EduMatch", tagline: "AI Tutoring Platform", port: 3005, live: true,
    desc: "AI-first homework help and tutor marketplace. Students get instant AI answers; tutors offer quotes. PostGIS geolocation matching and Stripe payments built in.",
    href: "http://localhost:3005",
    gradient: "linear-gradient(135deg,#fbbf24,#f59e0b)", glow: "rgba(251,191,36,0.42)",
    icon: <svg viewBox="0 0 24 24" fill="none" width="22" height="22" aria-hidden="true"><path d="M12 3 2 8l10 5 10-5-10-5Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" /><path d="M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinejoin="round" /><path d="M2 17l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinejoin="round" /></svg>,
  },
  {
    name: "Vionto", tagline: "AI Photo-to-Video", port: 3006, live: true,
    desc: "Upload photos, get a cinematic narrated MP4. GPT-4 + Claude write the script; ElevenLabs adds the voice. Three output modes, three aspect ratios, cloud export.",
    href: "http://localhost:3006",
    gradient: "linear-gradient(135deg,#f36f56,#e8b45d)", glow: "rgba(243,111,86,0.42)",
    icon: <svg viewBox="0 0 24 24" fill="none" width="22" height="22" aria-hidden="true"><rect x="2" y="6" width="20" height="13" rx="2.5" stroke="white" strokeWidth="1.5" /><path d="M8 10v4M12 8v8M16 10v4" stroke="white" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  },
];

const PILLARS = [
  {
    title: "Frontend", tag: "Interface",
    gradient: "linear-gradient(135deg,#4c7dff,#6aa3ff)",
    desc: "Design-forward UX, motion, and conversion-aware product surfaces. Every app shares a unified Tailwind v4 design system.",
    items: ["Next.js 16", "App Router", "TypeScript strict", "Tailwind v4", "Manrope + IBM Plex Mono"],
    icon: <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2.4" stroke="white" strokeWidth="1.6" /><path d="M3 8h18M8 21h8M12 17v4" stroke="white" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  },
  {
    title: "Backend", tag: "Architecture",
    gradient: "linear-gradient(135deg,#5de4c7,#36c6a8)",
    desc: "Durable APIs, Prisma ORM, async job queues with BullMQ, and shared packages wired across the entire pnpm monorepo.",
    items: ["Node.js 22", "PostgreSQL 16", "Prisma ORM", "Redis + BullMQ", "pnpm workspaces", "Docker Compose"],
    icon: <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true"><ellipse cx="12" cy="5.5" rx="7" ry="2.5" stroke="white" strokeWidth="1.6" /><path d="M5 5.5v6c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5v-6M5 11.5v6c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5v-6" stroke="white" strokeWidth="1.6" /></svg>,
  },
  {
    title: "AI", tag: "Intelligence",
    gradient: "linear-gradient(135deg,#c084fc,#f472b6)",
    desc: "RAG pipelines, streaming agents, TTS, video rendering, and AI-driven automations wired into production workflows.",
    items: ["OpenAI GPT-4.1", "Anthropic Claude", "ElevenLabs TTS", "Azure Speech", "Streaming SSE", "FFmpeg"],
    icon: <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true"><path d="M12 3v2M12 19v2M4.5 7.5l1.4 1.4M18.1 15.1l1.4 1.4M3 12h2M19 12h2M4.5 16.5l1.4-1.4M18.1 8.9l1.4-1.4" stroke="white" strokeWidth="1.5" strokeLinecap="round" /><circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.6" /><circle cx="12" cy="12" r="1.6" fill="white" /></svg>,
  },
];

const STACK_GROUPS = [
  { title: "Runtime & Tooling",  color: "#4c7dff", items: ["Node.js 22", "pnpm workspaces", "TypeScript strict mode", "Docker + Docker Compose"] },
  { title: "Data Layer",         color: "#5de4c7", items: ["PostgreSQL 16", "Prisma ORM", "Redis (BullMQ queues)", "DigitalOcean Spaces (S3)"] },
  { title: "AI Providers",       color: "#c084fc", items: ["OpenAI GPT-4.1-mini", "Anthropic Claude Haiku", "ElevenLabs TTS", "Azure Speech Services"] },
  { title: "Infrastructure",     color: "#f472b6", items: ["Docker multi-stage builds", "GitHub Actions CI/CD", "Nginx reverse proxy", "DigitalOcean VPS"] },
  { title: "Auth & Security",    color: "#fbbf24", items: ["NextAuth 5 beta", "JWT + SSO cookie", "RBAC roles per app", "@asafarim/auth shared pkg"] },
  { title: "Media & Storage",    color: "#f36f56", items: ["FFmpeg video rendering", "BullMQ async job queue", "S3-compatible CDN", "Local-file dev mode"] },
];

/* ─── Main component ────────────────────────────────────────────────────── */

export function HomeContent({ content: _content }: { content: ContentMap }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: KF }} />
      <div className="relative min-h-screen overflow-x-hidden bg-[var(--color-surface)] text-[var(--color-text)]">
        <div aria-hidden="true" className="site-noise" />
        <SiteHeader />
        <main className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6">

          {/* ── HERO ─────────────────────────────────────────────────── */}
          <section style={{ position:"relative", overflow:"hidden", borderRadius:"32px", border:"1px solid var(--color-border)", background:"var(--color-panel)", padding:"80px 32px 72px", marginTop:"28px", textAlign:"center" }}>
            <div aria-hidden style={{ position:"absolute", inset:0, borderRadius:"32px", opacity:0.88, background:"radial-gradient(circle at 15% 20%,rgba(76,125,255,0.22),transparent 38%),radial-gradient(circle at 85% 10%,rgba(192,132,252,0.18),transparent 40%),radial-gradient(circle at 70% 90%,rgba(93,228,199,0.18),transparent 42%)" }} />
            <div aria-hidden style={{ position:"absolute", inset:0, borderRadius:"32px", opacity:0.15, backgroundImage:"linear-gradient(var(--color-border-strong) 1px,transparent 1px),linear-gradient(90deg,var(--color-border-strong) 1px,transparent 1px)", backgroundSize:"48px 48px", maskImage:"radial-gradient(ellipse at center,black 40%,transparent 76%)", WebkitMaskImage:"radial-gradient(ellipse at center,black 40%,transparent 76%)" }} />
            {[
              { top:"4%",  left:"6%",   right:undefined as string|undefined, size:460, color:"#4c7dff", anim:"asm-orb-a 15s ease-in-out infinite" },
              { top:"52%", left:undefined as string|undefined, right:"5%",   size:400, color:"#c084fc", anim:"asm-orb-b 19s ease-in-out infinite" },
              { top:"32%", left:"42%",  right:undefined as string|undefined, size:320, color:"#5de4c7", anim:"asm-orb-c 24s ease-in-out infinite" },
            ].map(({ top, left, right, size, color, anim }, i) => (
              <div key={i} aria-hidden style={{ position:"absolute", top, left, right, width:size, height:size, borderRadius:"50%", background:`radial-gradient(circle,${color}13 0%,transparent 70%)`, animation:anim, pointerEvents:"none" }} />
            ))}
            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ display:"flex", justifyContent:"center", marginBottom:"28px" }}><AsmHeroMark /></div>
              <span style={{ display:"inline-flex", alignItems:"center", gap:"9px", padding:"6px 18px", borderRadius:"100px", background:"var(--color-panel-strong)", border:"1px solid var(--color-border-strong)", fontSize:"0.67rem", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--color-text-muted)", marginBottom:"28px" }}>
                <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#4ff2c9", display:"inline-block", flexShrink:0 }} />
                ASafariM Digital · Full-Stack SaaS + AI Platform
              </span>
              <h1 style={{ fontSize:"clamp(2.8rem,7vw,5.5rem)", fontWeight:900, lineHeight:1.04, letterSpacing:"-0.045em", margin:"0 0 24px", maxWidth:"860px", marginLeft:"auto", marginRight:"auto" }}>
                <span style={{ background:"linear-gradient(120deg,#6aa3ff 0%,#a78bfa 50%,#5de4c7 100%)", backgroundClip:"text", WebkitBackgroundClip:"text", color:"transparent", backgroundSize:"200% auto", animation:"asm-shimmer 5s linear infinite" }}>Ship full-stack SaaS</span>
                <br /><span style={{ color:"var(--color-text)" }}>with AI at the core.</span>
              </h1>
              <p style={{ fontSize:"clamp(1rem,2.2vw,1.2rem)", color:"var(--color-text-muted)", maxWidth:"600px", margin:"0 auto 44px", lineHeight:1.72 }}>
                Six production-grade apps sharing one Postgres database, one auth layer, and one design system — with <span style={{ color:"var(--color-text)", fontWeight:600 }}>AI wired into every workflow</span>.
              </p>
              <div style={{ display:"flex", gap:"14px", flexWrap:"wrap", justifyContent:"center", marginBottom:"52px" }}>
                <HoverAnchor href="#apps" primary>Explore the Platform <span aria-hidden="true">→</span></HoverAnchor>
                <HoverAnchor href="#stack">View Tech Stack</HoverAnchor>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"9px" }}>
                {([
                  { label:"6 Apps",             color:"#4c7dff" },
                  { label:"pnpm Monorepo",      color:"#5de4c7" },
                  { label:"Shared SSO",         color:"#c084fc" },
                  { label:"AI-Powered",         color:"#f472b6" },
                  { label:"Docker Compose",     color:"#fbbf24" },
                  { label:"PostgreSQL + Redis", color:"#f36f56" },
                ] as const).map(({ label, color }) => (
                  <span key={label} style={{ fontSize:"0.7rem", fontWeight:600, color, background:`${color}12`, border:`1px solid ${color}28`, borderRadius:"100px", padding:"5px 13px" }}>{label}</span>
                ))}
              </div>
            </div>
          </section>

          {/* ── APP ECOSYSTEM ────────────────────────────────────────── */}
          <section id="apps" style={{ marginTop:"80px", scrollMarginTop:"80px" }}>
            <Reveal>
              <div style={{ marginBottom:"44px" }}>
                <Eyebrow color="var(--color-primary)">Platform Suite · 6 Apps</Eyebrow>
                <SectionH2>One platform. Six products.</SectionH2>
                <Sub maxWidth={580}>
                  Every app shares a single PostgreSQL database, a shared{" "}
                  <code style={{ fontFamily:"var(--font-mono,monospace)", fontSize:"0.85em", background:"var(--color-surface)", padding:"1px 6px", borderRadius:"5px", border:"1px solid var(--color-border)" }}>@asafarim/auth</code>{" "}
                  package with full SSO, and a unified design system — so users move seamlessly between products.
                </Sub>
              </div>
            </Reveal>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))", gap:"18px" }}>
              {APPS.map((app, i) => <Reveal key={app.name} delay={i * 65}><AppCard app={app} /></Reveal>)}
            </div>
          </section>

          {/* ── CAPABILITIES ─────────────────────────────────────────── */}
          <section id="capabilities" style={{ marginTop:"80px", scrollMarginTop:"80px" }}>
            <Reveal>
              <div style={{ marginBottom:"44px" }}>
                <Eyebrow color="#5de4c7">Capabilities</Eyebrow>
                <SectionH2>Full-stack depth. <span style={{ background:"linear-gradient(120deg,#6aa3ff 0%,#a78bfa 50%,#5de4c7 100%)", backgroundClip:"text", WebkitBackgroundClip:"text", color:"transparent" }}>AI width.</span></SectionH2>
                <Sub>Three pillars — interface, architecture, and intelligence — running in concert across every app.</Sub>
              </div>
            </Reveal>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:"18px" }}>
              {PILLARS.map((p, i) => <Reveal key={p.title} delay={i * 80}><Pillar {...p} /></Reveal>)}
            </div>
          </section>

          {/* ── TECH STACK ───────────────────────────────────────────── */}
          <section id="stack" style={{ marginTop:"80px", scrollMarginTop:"80px" }}>
            <Reveal>
              <div style={{ marginBottom:"44px" }}>
                <Eyebrow color="#c084fc">Tech Stack</Eyebrow>
                <SectionH2>Production-grade from day one.</SectionH2>
                <Sub>No shortcuts. Every layer — runtime, data, AI, and infra — chosen for real-world durability and scale.</Sub>
              </div>
            </Reveal>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:"18px" }}>
              {STACK_GROUPS.map(({ title, color, items }, i) => <Reveal key={title} delay={i * 55}><StackGroup title={title} color={color} items={items} /></Reveal>)}
            </div>
          </section>

          {/* ── SSO CALLOUT ──────────────────────────────────────────── */}
          <section style={{ marginTop:"80px" }}>
            <Reveal>
              <div style={{ borderRadius:"32px", border:"1px solid var(--color-border-strong)", background:"linear-gradient(135deg,var(--color-panel-strong),var(--color-panel))", padding:"56px 40px", textAlign:"center", position:"relative", overflow:"hidden" }}>
                <div aria-hidden style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 60% at 50% 50%,rgba(76,125,255,0.1) 0%,transparent 68%)", pointerEvents:"none" }} />
                <div style={{ position:"relative", zIndex:1 }}>
                  <Eyebrow color="var(--color-accent)">Shared Auth Layer</Eyebrow>
                  <h2 style={{ fontSize:"clamp(1.7rem,3.5vw,2.8rem)", fontWeight:800, letterSpacing:"-0.03em", margin:"0 0 14px", color:"var(--color-text)" }}>
                    Sign in once.{" "}
                    <span style={{ background:"linear-gradient(120deg,#6aa3ff,#a78bfa 50%,#5de4c7)", backgroundClip:"text", WebkitBackgroundClip:"text", color:"transparent" }}>Access everything.</span>
                  </h2>
                  <p style={{ color:"var(--color-text-muted)", maxWidth:"500px", margin:"0 auto 36px", lineHeight:1.72, fontSize:"0.95rem" }}>
                    NextAuth 5 with a shared{" "}
                    <code style={{ fontFamily:"var(--font-mono,monospace)", fontSize:"0.85em", background:"var(--color-surface)", padding:"2px 6px", borderRadius:"6px", border:"1px solid var(--color-border)" }}>@asafarim/auth</code>{" "}
                    package wires SSO across all six apps — same session cookie, same user record, same roles.
                  </p>
                  <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"9px" }}>
                    {APPS.map((app) => (
                      <a key={app.name} href={app.href}
                        style={{ display:"inline-flex", alignItems:"center", gap:"7px", fontSize:"0.73rem", fontWeight:600, color:"var(--color-text-muted)", background:"var(--color-surface)", border:"1px solid var(--color-border)", borderRadius:"100px", padding:"6px 13px", textDecoration:"none", transition:"border-color 0.18s,color 0.18s" }}
                        onMouseEnter={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor="var(--color-border-strong)"; el.style.color="var(--color-text)"; }}
                        onMouseLeave={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor="var(--color-border)"; el.style.color="var(--color-text-muted)"; }}
                      >
                        <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"var(--color-accent)", display:"inline-block", flexShrink:0 }} />
                        {app.name}<span style={{ fontFamily:"var(--font-mono,monospace)", fontSize:"0.78em", opacity:0.42 }}>:{app.port}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </section>

          {/* ── CTA / CONTACT ────────────────────────────────────────── */}
          <section id="contact" style={{ marginTop:"80px" }}>
            <Reveal>
              <div style={{ borderRadius:"32px", border:"1px solid var(--color-border-strong)", background:"linear-gradient(135deg,var(--color-panel-strong),rgba(13,25,45,0.92))", padding:"72px 40px", textAlign:"center", position:"relative", overflow:"hidden" }}>
                <div aria-hidden style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 90% 70% at 50% 0%,rgba(192,132,252,0.1) 0%,transparent 65%),radial-gradient(ellipse 70% 50% at 50% 100%,rgba(76,125,255,0.08) 0%,transparent 68%)", pointerEvents:"none" }} />
                <div style={{ position:"relative", zIndex:1 }}>
                  <Eyebrow color="#f472b6">Let's Work Together</Eyebrow>
                  <h2 style={{ fontSize:"clamp(2rem,4.5vw,3.6rem)", fontWeight:900, letterSpacing:"-0.04em", margin:"0 0 16px", color:"var(--color-text)" }}>Ready to build something great?</h2>
                  <p style={{ color:"var(--color-text-muted)", maxWidth:"440px", margin:"0 auto 44px", lineHeight:1.72, fontSize:"0.97rem" }}>
                    Full-stack engineering, AI integration, or a complete SaaS product — reach out.
                  </p>
                  <div style={{ display:"flex", gap:"14px", flexWrap:"wrap", justifyContent:"center" }}>
                    <HoverAnchor href="mailto:asafarim@gmail.com" primary>asafarim@gmail.com <span aria-hidden="true">→</span></HoverAnchor>
                    <HoverAnchor href="https://github.com/alisafari-it" external>GitHub</HoverAnchor>
                  </div>
                </div>
              </div>
            </Reveal>
          </section>

        </main>
        <SiteFooter />
      </div>
    </>
  );
}
