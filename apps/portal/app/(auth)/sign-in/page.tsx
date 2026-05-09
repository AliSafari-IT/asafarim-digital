"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Suspense, useEffect, useMemo, useState } from "react";

// ─── Utilities (unchanged logic) ─────────────────────────────────────────────

function isTrustedCallbackOrigin(origin: string): boolean {
  if (typeof window !== "undefined" && origin === window.location.origin) return true;
  const allowList = [
    process.env.NEXT_PUBLIC_CONTENT_GENERATOR_URL,
    process.env.NEXT_PUBLIC_PORTAL_URL,
    process.env.NEXT_PUBLIC_OPS_HUB_URL,
    process.env.NEXT_PUBLIC_EDUMATCH_URL,
  ]
    .filter((v): v is string => Boolean(v))
    .map((v) => { try { return new URL(v).origin; } catch { return null; } })
    .filter((v): v is string => Boolean(v));
  if (allowList.includes(origin)) return true;
  try {
    const host = new URL(origin).hostname;
    if (host.endsWith(".asafarim.com") || host === "asafarim.com") return true;
    if (host === "localhost" || host === "127.0.0.1") return true;
  } catch { /* ignore */ }
  return false;
}

function normalizeCallbackUrl(raw: string | null): string {
  if (!raw) return "/";
  if (raw.startsWith("/") && !raw.startsWith("//")) {
    if (raw.startsWith("/sign-in") || raw.startsWith("/sign-up")) return "/";
    return raw;
  }
  try {
    const parsed = new URL(raw);
    if (isTrustedCallbackOrigin(parsed.origin)) {
      let pathname = parsed.pathname;
      if (pathname === "/sign-in" || pathname === "/sign-up") pathname = "/";
      if (typeof window !== "undefined" && parsed.origin === window.location.origin) {
        return pathname + parsed.search + parsed.hash || "/";
      }
      return parsed.origin + pathname + parsed.search + parsed.hash;
    }
  } catch { /* ignore */ }
  return "/";
}

// ─── Brand Panel (left column) ────────────────────────────────────────────────

const APPS = [
  { label: "Portal",            color: "#4c7dff", x: 110, y: 34  },
  { label: "Content Gen",       color: "#c084fc", x: 176, y: 72  },
  { label: "Ops Hub",           color: "#5de4c7", x: 176, y: 148 },
  { label: "EduMatch",          color: "#fbbf24", x: 110, y: 186 },
  { label: "Marketing",         color: "#f472b6", x: 44,  y: 148 },
  { label: "Vionto",            color: "#f36f56", x: 44,  y: 72  },
];

function BrandMark() {
  return (
    <>
      <style>{`
        @keyframes bm-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes bm-pulse { 0%,100%{opacity:.4;r:3} 50%{opacity:1;r:5} }
        @keyframes bm-spin-f { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes bm-spin-r { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
        .bm-root { animation: bm-float 6s ease-in-out infinite; transform-origin:110px 110px; }
        .bm-orbit1 { animation: bm-spin-f 18s linear infinite; transform-origin:110px 110px; }
        .bm-orbit2 { animation: bm-spin-r 26s linear infinite; transform-origin:110px 110px; }
      `}</style>
      <svg viewBox="0 0 220 220" className="bm-root w-full max-w-[220px]" aria-hidden="true">
        <defs>
          <radialGradient id="si-gcore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4c7dff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4c7dff" stopOpacity="0" />
          </radialGradient>
          <filter id="si-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Glow halo */}
        <circle cx="110" cy="110" r="52" fill="url(#si-gcore)" />

        {/* Orbit rings */}
        <g className="bm-orbit1" opacity="0.25">
          <circle cx="110" cy="110" r="76" fill="none" stroke="#4c7dff" strokeWidth="1" strokeDasharray="6 10" />
        </g>
        <g className="bm-orbit2" opacity="0.15">
          <circle cx="110" cy="110" r="96" fill="none" stroke="#5de4c7" strokeWidth="1" strokeDasharray="3 14" />
        </g>

        {/* Connection lines */}
        {APPS.map((app, i) => (
          <line key={`l${i}`} x1="110" y1="110" x2={app.x} y2={app.y}
            stroke={app.color} strokeWidth="1" opacity="0.2" />
        ))}

        {/* App nodes */}
        {APPS.map((app, i) => (
          <g key={`n${i}`} filter="url(#si-glow)">
            <circle cx={app.x} cy={app.y} r="8" fill={app.color} opacity="0.15" />
            <circle cx={app.x} cy={app.y} r="4" fill={app.color} opacity="0.9" />
          </g>
        ))}

        {/* Centre mark */}
        <circle cx="110" cy="110" r="28" fill="none" stroke="#4c7dff" strokeWidth="1.5" opacity="0.4" />
        <circle cx="110" cy="110" r="22" fill="#07111f" />
        <text x="110" y="110" textAnchor="middle" dominantBaseline="central"
          fontSize="11" fontWeight="700" fill="#4c7dff" letterSpacing="1" fontFamily="system-ui">AD</text>
      </svg>
    </>
  );
}

function BrandPanel() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-10 overflow-hidden px-8 py-16 text-center lg:items-start lg:text-left">
      {/* bg texture */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#07111f_0%,#0b1a30_100%)]" />
        <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-[#4c7dff] opacity-[0.08] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#c084fc] opacity-[0.07] blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMC41IiBjeT0iMC41IiByPSIwLjUiIGZpbGw9InJnYmEoMTI5LDE0OSwxODEsMC4wOCkiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZykiLz48L3N2Zz4=')] opacity-60" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 lg:items-start">
        <BrandMark />

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#4c7dff]">ASafariM Digital</p>
          <h2 className="mt-2 text-2xl font-bold leading-tight text-white lg:text-3xl">
            One workspace.<br className="hidden lg:block" /> Every product.
          </h2>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#9fb0cf]">
            The unified portal for AI-native SaaS tools, campaigns, education, and media — secured by a single sign-on.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
          {APPS.map((app) => (
            <span
              key={app.label}
              className="rounded-full border px-2.5 py-1 text-[11px] font-medium"
              style={{ borderColor: `${app.color}44`, color: app.color, background: `${app.color}0f` }}
            >
              {app.label}
            </span>
          ))}
        </div>

        <p className="text-xs text-[#9fb0cf]/60">
          © {new Date().getFullYear()} ASafariM Digital · Secure SSO
        </p>
      </div>
    </div>
  );
}

// ─── Input field ──────────────────────────────────────────────────────────────

function Field({
  id, label, type = "text", value, onChange, autoComplete, placeholder, required, suffix, hint,
}: {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; autoComplete?: string; placeholder?: string;
  required?: boolean; suffix?: React.ReactNode; hint?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;

  return (
    <div className="group relative flex flex-col gap-1">
      <label
        htmlFor={id}
        className={`text-xs font-semibold transition-colors duration-150 ${
          focused ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"
        }`}
      >
        {label}{required && <span className="ml-0.5 text-[var(--color-danger)]" aria-hidden="true">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
          className={`h-12 w-full rounded-xl border bg-[var(--color-surface-soft)] px-4 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 outline-none transition-all duration-150 ${
            focused
              ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
              : "border-[var(--color-border-strong)] hover:border-[var(--color-border-strong)]/80"
          } ${suffix ? "pr-12" : ""}`}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
        )}
      </div>
      {hint}
    </div>
  );
}

// ─── Password field with show/hide ────────────────────────────────────────────

function PasswordField({
  id, label, value, onChange, autoComplete, placeholder, required, hint,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  autoComplete?: string; placeholder?: string; required?: boolean; hint?: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  return (
    <Field
      id={id} label={label} type={show ? "text" : "password"}
      value={value} onChange={onChange} autoComplete={autoComplete}
      placeholder={placeholder} required={required} hint={hint}
      suffix={
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
          className="flex h-6 w-6 items-center justify-center rounded text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]"
        >
          {show ? (
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5S2 8 2 8z" stroke="currentColor" strokeWidth="1.4" />
              <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5S1 8 1 8z" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          )}
        </button>
      }
    />
  );
}

// ─── Google button ────────────────────────────────────────────────────────────

function GoogleButton({ onClick, disabled, label }: { onClick: () => void; disabled: boolean; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="relative flex h-12 w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-soft)]/80 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      {label}
    </button>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-[var(--color-border)]" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">or</span>
      <div className="h-px flex-1 bg-[var(--color-border)]" />
    </div>
  );
}

// ─── Error alert ──────────────────────────────────────────────────────────────

function ErrorAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-[#6c3040] bg-[#2f131c] px-4 py-3 text-sm text-[#ff9aac]"
      style={{ animation: "shake 0.35s ease both" }}
    >
      <svg viewBox="0 0 16 16" fill="none" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {message}
    </div>
  );
}

// ─── Sign-in form ─────────────────────────────────────────────────────────────

function SignInPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const callbackUrl = useMemo(() => normalizeCallbackUrl(searchParams.get("callbackUrl")), [searchParams]);
  const error = useMemo(() => searchParams.get("error"), [searchParams]);
  const signUpHref = useMemo(() => `/sign-up?${new URLSearchParams({ callbackUrl })}`, [callbackUrl]);
  const forgotPasswordHref = useMemo(() => `/forgot-password?${new URLSearchParams({ callbackUrl })}`, [callbackUrl]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (error === "CredentialsSignin") setErrorMessage("Invalid email or password");
  }, [error]);

  useEffect(() => {
    if (status === "authenticated") {
      if (/^https?:\/\//.test(callbackUrl)) window.location.href = callbackUrl;
      else router.replace(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    try {
      const result = await signIn("credentials", { email, password, callbackUrl, redirect: false });
      if (result?.error) {
        setErrorMessage("Invalid email or password");
      } else if (result?.url) {
        window.location.href = result.url;
      } else if (/^https?:\/\//.test(callbackUrl)) {
        window.location.href = callbackUrl;
      } else {
        router.replace(callbackUrl);
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsLoading(true);
    await signIn("google", { callbackUrl, redirect: true });
  }

  return (
    <div className="flex min-h-[100dvh] flex-col lg:flex-row">
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)}
        }
        @keyframes fadeInUp {
          from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)}
        }
        .auth-form-enter { animation: fadeInUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      {/* ── Left brand panel (desktop) ── */}
      <div className="hidden lg:flex lg:w-[45%] lg:shrink-0">
        <BrandPanel />
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-16 sm:px-8 lg:py-12">
        {/* Mobile logo */}
        <div className="mb-8 flex flex-col items-center gap-2 lg:hidden">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-primary),var(--color-accent))] text-sm font-bold text-white shadow-[var(--shadow-glow)]">
            AD
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">ASafariM Digital</p>
        </div>

        <div className="auth-form-enter w-full max-w-[420px]">
          {/* Heading */}
          <div className="mb-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">Welcome back</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-text)]">Sign in</h1>
            <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
              New here?{" "}
              <Link href={signUpHref} className="font-semibold text-[var(--color-primary)] underline underline-offset-2 hover:no-underline">
                Create an account
              </Link>
            </p>
          </div>

          {errorMessage && <ErrorAlert message={errorMessage} />}

          <div className="mt-5 flex flex-col gap-4">
            <GoogleButton
              onClick={handleGoogleSignIn}
              disabled={isLoading || status === "loading"}
              label="Continue with Google"
            />

            <Divider />

            <form onSubmit={handleCredentialsSubmit} className="flex flex-col gap-4">
              <Field
                id="email" label="Email address" type="email"
                value={email} onChange={setEmail}
                autoComplete="email" placeholder="you@example.com" required
              />
              <PasswordField
                id="password" label="Password"
                value={password} onChange={setPassword}
                autoComplete="current-password" placeholder="Enter your password" required
                hint={
                  <div className="flex justify-end">
                    <Link href={forgotPasswordHref}
                      className="text-[11px] font-semibold text-[var(--color-primary)] hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                }
              />

              <button
                type="submit"
                disabled={isLoading || status === "loading"}
                className="relative mt-1 flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-[var(--color-primary)] text-sm font-semibold text-white shadow-[0_8px_24px_-10px_rgba(76,125,255,0.7)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="20" />
                    </svg>
                    Signing in…
                  </span>
                ) : "Sign in →"}
              </button>
            </form>
          </div>

          <p className="mt-8 text-center text-[11px] text-[var(--color-text-muted)]">
            Protected by{" "}
            <span className="font-semibold text-[var(--color-text-muted)]/80">NextAuth</span>
            {" "}· Credentials & Google SSO
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInPageContent />
    </Suspense>
  );
}
