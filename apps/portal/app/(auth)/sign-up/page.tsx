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
    process.env.NEXT_PUBLIC_MARKETING_CONTENT_URL,
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
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  try {
    const parsed = new URL(raw);
    if (isTrustedCallbackOrigin(parsed.origin)) {
      if (typeof window !== "undefined" && parsed.origin === window.location.origin) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}` || "/";
      }
      return parsed.toString();
    }
  } catch { /* ignore */ }
  return "/";
}

// ─── Brand Panel ──────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: "🔐", text: "Single SSO across all products" },
  { icon: "🤖", text: "Access AI content & automation tools" },
  { icon: "📊", text: "Campaign & lead tracking built in" },
  { icon: "🎓", text: "Learning & education modules (EduMatch)" },
  { icon: "🎬", text: "AI video generation via Vionto" },
];

function BrandPanel() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-10 overflow-hidden px-8 py-16 text-center lg:items-start lg:text-left">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#07111f_0%,#0a1628_100%)]" />
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#c084fc] opacity-[0.08] blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#4c7dff] opacity-[0.07] blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMC41IiBjeT0iMC41IiByPSIwLjUiIGZpbGw9InJnYmEoMTI5LDE0OSwxODEsMC4wOCkiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZykiLz48L3N2Zz4=')] opacity-50" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 lg:items-start">
        {/* Monogram */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#4c7dff,#5de4c7)] text-xl font-bold text-white shadow-[0_16px_40px_-12px_rgba(76,125,255,0.6)]">
          AD
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#5de4c7]">Free account</p>
          <h2 className="mt-2 text-2xl font-bold leading-snug text-white lg:text-3xl">
            Join the<br className="hidden lg:block" /> product ecosystem.
          </h2>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#9fb0cf]">
            One account. Unlimited access to ASafariM tools, from AI content generation to ops automation.
          </p>
        </div>

        <ul className="flex flex-col gap-3">
          {FEATURES.map((f) => (
            <li key={f.text} className="flex items-center gap-3 text-sm text-[#9fb0cf]">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-base">{f.icon}</span>
              {f.text}
            </li>
          ))}
        </ul>

        <p className="text-xs text-[#9fb0cf]/50">
          No credit card required · Instant access
        </p>
      </div>
    </div>
  );
}

// ─── Shared UI components ─────────────────────────────────────────────────────

function Field({
  id, label, type = "text", value, onChange, autoComplete, placeholder, required, suffix, hint,
}: {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; autoComplete?: string; placeholder?: string;
  required?: boolean; suffix?: React.ReactNode; hint?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className={`text-xs font-semibold transition-colors ${focused ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`}>
        {label}{required && <span className="ml-0.5 text-[var(--color-danger)]" aria-hidden="true">*</span>}
      </label>
      <div className="relative">
        <input
          id={id} type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete} placeholder={placeholder} required={required}
          className={`h-12 w-full rounded-xl border bg-[var(--color-surface-soft)] px-4 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 outline-none transition-all ${
            focused
              ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
              : "border-[var(--color-border-strong)]"
          } ${suffix ? "pr-12" : ""}`}
        />
        {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
      </div>
      {hint}
    </div>
  );
}

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
        <button type="button" onClick={() => setShow(v => !v)}
          aria-label={show ? "Hide" : "Show"}
          className="flex h-6 w-6 items-center justify-center rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition">
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

// ─── Password strength ────────────────────────────────────────────────────────

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const capped = Math.min(4, Math.ceil(score * 4 / 5));
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];
  return { score: capped, label: labels[capped], color: colors[capped] };
}

function PasswordStrengthBar({ password }: { password: string }) {
  const { score, label, color } = passwordStrength(password);
  if (!password) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? color : "rgba(129,149,181,0.15)" }}
          />
        ))}
      </div>
      {label && (
        <p className="text-[11px] font-semibold" style={{ color }}>{label} password</p>
      )}
    </div>
  );
}

// ─── Shared atoms ──────────────────────────────────────────────────────────────

function GoogleButton({ onClick, disabled, label }: { onClick: () => void; disabled: boolean; label: string }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
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

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-[var(--color-border)]" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">or</span>
      <div className="h-px flex-1 bg-[var(--color-border)]" />
    </div>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div role="alert"
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

// ─── Sign-up form ─────────────────────────────────────────────────────────────

function SignUpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const callbackUrl = useMemo(() => normalizeCallbackUrl(searchParams.get("callbackUrl")), [searchParams]);
  const signInHref = useMemo(() => `/sign-in?${new URLSearchParams({ callbackUrl })}`, [callbackUrl]);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const pwMatch = confirmPassword.length > 0 && password !== confirmPassword;

  useEffect(() => {
    if (status === "authenticated") {
      if (/^https?:\/\//.test(callbackUrl)) window.location.href = callbackUrl;
      else router.replace(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  async function handleGoogleSignUp() {
    setIsLoading(true);
    await signIn("google", { callbackUrl, redirect: true });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    if (!username.trim()) { setErrorMessage("Username is required"); setIsLoading(false); return; }
    if (password !== confirmPassword) { setErrorMessage("Passwords do not match"); setIsLoading(false); return; }
    if (password.length < 8) { setErrorMessage("Password must be at least 8 characters"); setIsLoading(false); return; }
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password }),
      });
      const data = await response.json();
      if (!response.ok) { setErrorMessage(data.error || "Registration failed"); setIsLoading(false); return; }
      const result = await signIn("credentials", { email, password, callbackUrl, redirect: false });
      if (result?.error) router.push(signInHref);
      else if (result?.url) window.location.href = result.url;
      else if (/^https?:\/\//.test(callbackUrl)) window.location.href = callbackUrl;
      else router.replace(callbackUrl);
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col lg:flex-row">
      <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .auth-form-enter { animation: fadeInUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      {/* Brand panel (desktop) */}
      <div className="hidden lg:flex lg:w-[45%] lg:shrink-0">
        <BrandPanel />
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-16 sm:px-8 lg:overflow-y-auto lg:py-10">
        {/* Mobile logo */}
        <div className="mb-8 flex flex-col items-center gap-2 lg:hidden">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-primary),var(--color-accent))] text-sm font-bold text-white shadow-[var(--shadow-glow)]">
            AD
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">ASafariM Digital</p>
        </div>

        <div className="auth-form-enter w-full max-w-[440px]">
          {/* Heading */}
          <div className="mb-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#5de4c7]">Free forever</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-text)]">Create account</h1>
            <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
              Already have one?{" "}
              <Link href={signInHref} className="font-semibold text-[var(--color-primary)] underline underline-offset-2 hover:no-underline">
                Sign in
              </Link>
            </p>
          </div>

          {errorMessage && <ErrorAlert message={errorMessage} />}

          <div className="mt-5 flex flex-col gap-4">
            <GoogleButton
              onClick={handleGoogleSignUp}
              disabled={isLoading || status === "loading"}
              label="Sign up with Google"
            />

            <Divider />

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* 2-col name + username on larger screens */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field id="name" label="Full name" value={name} onChange={setName}
                  autoComplete="name" placeholder="Jane Smith" required />
                <Field id="username" label="Username" value={username} onChange={setUsername}
                  autoComplete="username" placeholder="jane_smith" required
                  hint={
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      Permanent · cannot be changed
                    </p>
                  }
                />
              </div>

              <Field id="email" label="Email address" type="email" value={email} onChange={setEmail}
                autoComplete="email" placeholder="you@example.com" required />

              <div className="flex flex-col gap-1">
                <PasswordField id="password" label="Password" value={password} onChange={setPassword}
                  autoComplete="new-password" placeholder="At least 8 characters" required />
                <PasswordStrengthBar password={password} />
              </div>

              <div className="flex flex-col gap-1">
                <PasswordField id="confirmPassword" label="Confirm password"
                  value={confirmPassword} onChange={setConfirmPassword}
                  autoComplete="new-password" placeholder="Repeat your password" required />
                {pwMatch && (
                  <p className="text-[11px] font-semibold text-[var(--color-danger)]">
                    Passwords don't match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || status === "loading" || pwMatch}
                className="mt-1 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[#6aa3ff] text-sm font-semibold text-white shadow-[0_8px_24px_-10px_rgba(76,125,255,0.7)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="20" />
                    </svg>
                    Creating account…
                  </span>
                ) : "Create account →"}
              </button>
            </form>
          </div>

          <p className="mt-8 text-center text-[11px] text-[var(--color-text-muted)]">
            By continuing you agree to our{" "}
            <span className="font-semibold text-[var(--color-text-muted)]/80">Terms of Service</span>
            {" "}and{" "}
            <span className="font-semibold text-[var(--color-text-muted)]/80">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpPageContent />
    </Suspense>
  );
}
