"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "@asafarim/shared-i18n";

type ProfileData = {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  emailVerified: string | Date | null;
  image: string | null;
  roles: string[];
  jobTitle: string | null;
  company: string | null;
  website: string | null;
  location: string | null;
  bio: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

type CentralAppProfiles = {
  edumatch: {
    student: {
      gradeLevel: string;
      subjectsOfInterest: string[];
      updatedAt: string;
    } | null;
    tutor: {
      bio: string | null;
      subjectsTaught: string[];
      levelsTaught: string[];
      hourlyRateCents: number;
      onlineOnly: boolean;
      serviceRadiusKm: number;
      payoutEnabled: boolean;
      verifiedAt: string | null;
      ratingAvg: number;
      ratingCount: number;
      updatedAt: string;
    } | null;
    stats: {
      inquiries: number;
      quotes: number;
      studentBookings: number;
      tutorBookings: number;
    };
  };
  vionto: {
    stats: {
      projects: number;
      assets: number;
      exports: number;
      sharedWithMe: number;
    };
    recentProjects: Array<{
      id: string;
      title: string;
      mode: string;
      storyMode: string | null;
      emotionalTone: string | null;
      visualStyle: string | null;
      status: string;
      updatedAt: string;
    }>;
    usage: Array<{
      metric: string;
      value: number;
      periodStart: string;
    }>;
  };
};

function resolvePortalAvatarSrc(src?: string | null) {
  if (!src) return null;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/api/uploads/avatars/")) return src;
  if (src.startsWith("/uploads/avatars/")) {
    return src.replace("/uploads/avatars/", "/api/uploads/avatars/");
  }
  return src;
}

export function ProfileForm({
  user,
  appProfiles,
}: {
  user: ProfileData;
  appProfiles: CentralAppProfiles;
}) {
  const { update } = useSession();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: user.name ?? "",
    username: user.username ?? "",
    image: user.image ?? "",
    jobTitle: user.jobTitle ?? "",
    company: user.company ?? "",
    website: user.website ?? "",
    location: user.location ?? "",
    bio: user.bio ?? "",
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [verifyMessage, setVerifyMessage] = useState("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const [resetPasswordStatus, setResetPasswordStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resetPasswordMessage, setResetPasswordMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isVerified = Boolean(user.emailVerified);
  const usernameLocked = Boolean(user.username);

  async function handleSendVerification() {
    setVerifyStatus("sending");
    setVerifyMessage("");
    try {
      const response = await fetch("/api/auth/send-verification", { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setVerifyStatus("error");
        setVerifyMessage(data.error || t("portal.profile.error.verification"));
        return;
      }
      setVerifyStatus("sent");
      setVerifyMessage(data.message || t("portal.profile.verificationSent"));
    } catch {
      setVerifyStatus("error");
      setVerifyMessage(t("portal.profile.error.verificationNetwork"));
    }
  }

  async function handleSendPasswordReset() {
    setResetPasswordStatus("sending");
    setResetPasswordMessage("");
    try {
      const response = await fetch("/api/auth/reset-password/request", { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setResetPasswordStatus("error");
        setResetPasswordMessage(data.error || t("portal.profile.error.reset"));
        return;
      }
      setResetPasswordStatus("sent");
      setResetPasswordMessage(data.message || t("portal.profile.resetSent"));
    } catch {
      setResetPasswordStatus("error");
      setResetPasswordMessage(t("portal.profile.error.resetNetwork"));
    }
  }

  async function uploadAvatarFile(file: File) {
    if (!isVerified) {
      setUploadStatus("error");
      setUploadMessage(t("portal.profile.error.verifyBeforeUpload"));
      return;
    }
    if (!file.type.startsWith("image/")) {
      setUploadStatus("error");
      setUploadMessage(t("portal.profile.error.fileType"));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadStatus("error");
      setUploadMessage(t("portal.profile.error.fileSize"));
      return;
    }

    setUploadStatus("uploading");
    setUploadMessage("");

    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/profile/avatar", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setUploadStatus("error");
        setUploadMessage(data.error || t("portal.profile.error.upload"));
        return;
      }
      setField("image", data.image);
      setUploadStatus("idle");
      setUploadMessage("");
      await update({ image: data.image });
    } catch {
      setUploadStatus("error");
      setUploadMessage(t("portal.profile.error.uploadNetwork"));
    }
  }

  function handleFileInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void uploadAvatarFile(file);
    event.target.value = "";
  }

  async function handleRemoveAvatar() {
    if (!isVerified) return;
    setUploadStatus("uploading");
    setUploadMessage("");
    try {
      const response = await fetch("/api/profile/avatar", { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setUploadStatus("error");
        setUploadMessage(data.error || t("portal.profile.error.remove"));
        return;
      }
      setField("image", "");
      setUploadStatus("idle");
      await update({ image: null });
    } catch {
      setUploadStatus("error");
      setUploadMessage(t("portal.profile.error.removeNetwork"));
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void uploadAvatarFile(file);
  }

  async function handleCopyUserId() {
    try {
      await navigator.clipboard.writeText(user.id);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = user.id;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("saving");
    setErrorMessage("");

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(data.error || t("portal.profile.error.update"));
        return;
      }

      await update({ image: data.user.image, name: data.user.name });
      setStatus("saved");
      setForm({
        name: data.user.name ?? "",
        username: data.user.username ?? "",
        image: data.user.image ?? "",
        jobTitle: data.user.jobTitle ?? "",
        company: data.user.company ?? "",
        website: data.user.website ?? "",
        location: data.user.location ?? "",
        bio: data.user.bio ?? "",
      });
      window.setTimeout(() => setStatus("idle"), 2400);
    } catch {
      setStatus("error");
      setErrorMessage(t("portal.profile.error.save"));
    }
  }

  function setField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <aside className="rounded-[2rem] border border-[var(--color-border-strong)] bg-[var(--color-panel-strong)] p-8 shadow-[var(--shadow-card)] xl:sticky xl:top-28 xl:h-fit">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">{t("portal.profile.control")}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">{t("portal.profile.title")}</h1>
          </div>
          <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            {user.roles?.join(", ") || "—"}
          </span>
        </div>

        <div className="mt-8 rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
          <div className="flex items-center gap-4">
            {resolvePortalAvatarSrc(form.image) ? (
              <img src={resolvePortalAvatarSrc(form.image) ?? undefined} alt={form.name || user.email} className="h-18 w-18 rounded-2xl object-cover" />
            ) : (
              <div className="flex h-18 w-18 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-primary),var(--color-accent))] text-xl font-semibold text-white">
                {(form.name || user.email).slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold">{form.name || t("portal.profile.unnamed")}</h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">@{form.username || t("portal.profile.claimUsername")}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{t("portal.profile.email")}</p>
              <p className="mt-2 text-sm">{user.email}</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{t("portal.profile.verification")}</p>
              <p className={`mt-2 text-sm ${isVerified ? "text-emerald-600 dark:text-emerald-300" : "text-amber-600 dark:text-amber-300"}`}>
                {isVerified ? t("portal.profile.verified") : t("portal.profile.unverified")}
              </p>
              {!isVerified && (
                <div className="mt-3 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleSendVerification}
                    disabled={verifyStatus === "sending" || verifyStatus === "sent"}
                    className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {verifyStatus === "sending"
                      ? t("portal.profile.sending")
                      : verifyStatus === "sent"
                        ? t("portal.profile.verificationSent")
                        : t("portal.profile.sendVerification")}
                  </button>
                  {verifyMessage && (
                    <p
                      className={`text-xs ${
                        verifyStatus === "error" ? "text-rose-600 dark:text-rose-300" : "text-[var(--color-text-muted)]"
                      }`}
                    >
                      {verifyMessage}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{t("portal.profile.usernamePolicy")}</p>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                {t("portal.profile.usernamePolicyDesc")}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyUserId}
              className="group flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3 text-left transition hover:border-[var(--color-primary)]/50"
            >
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{t("portal.profile.userId")}</p>
                <p className="mt-2 text-xs font-mono text-[var(--color-text-muted)]">{user.id}</p>
              </div>
              {copyStatus === "copied" ? (
                <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-4 w-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{t("portal.profile.password")}</p>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                {t("portal.profile.passwordDesc")}
              </p>
              <button
                type="button"
                onClick={handleSendPasswordReset}
                disabled={resetPasswordStatus === "sending" || resetPasswordStatus === "sent"}
                className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resetPasswordStatus === "sending"
                  ? t("portal.profile.sending")
                  : resetPasswordStatus === "sent"
                    ? t("portal.profile.resetSent")
                    : t("portal.profile.sendReset")}
              </button>
              {resetPasswordMessage && (
                <p
                  className={`mt-2 text-xs ${
                    resetPasswordStatus === "error" ? "text-rose-600 dark:text-rose-300" : "text-[var(--color-text-muted)]"
                  }`}
                >
                  {resetPasswordMessage}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{t("portal.profile.quickLinks")}</p>
            <a
              href={process.env.NEXT_PUBLIC_EDUMATCH_URL || "http://localhost:3005"}
              className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-text)] transition hover:border-[var(--color-primary)]/50 hover:text-[var(--color-primary)]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              EduMatch
            </a>
            <a
              href={process.env.NEXT_PUBLIC_VIONTO_URL || "http://localhost:3006"}
              className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-text)] transition hover:border-[var(--color-primary)]/50 hover:text-[var(--color-primary)]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Vionto
            </a>
            <a
              href={process.env.NEXT_PUBLIC_CONTENT_GENERATOR_URL || "http://localhost:3001"}
              className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-text)] transition hover:border-[var(--color-primary)]/50 hover:text-[var(--color-primary)]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Content Generator
            </a>
            <a
              href={process.env.NEXT_PUBLIC_OPS_HUB_URL || "http://localhost:3003"}
              className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-text)] transition hover:border-[var(--color-primary)]/50 hover:text-[var(--color-primary)]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Ops Hub
            </a>
            <a
              href={process.env.NEXT_PUBLIC_MARKETING_CONTENT_URL || "http://localhost:3004"}
              className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-text)] transition hover:border-[var(--color-primary)]/50 hover:text-[var(--color-primary)]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Marketing Content
            </a>
            <a
              href="/api/auth/signout"
              className="flex items-center gap-3 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300 transition hover:border-rose-400/50 hover:bg-rose-400/20"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {t("portal.profile.signOut")}
            </a>
          </div>
        </div>
      </aside>

      <section className="rounded-[2rem] border border-[var(--color-border-strong)] bg-[var(--color-panel)] p-8 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">{t("portal.profile.settings")}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">{t("portal.profile.settingsDesc")}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-text-muted)]">
              {t("portal.profile.settingsSubtext")}
            </p>
          </div>

          <div className="text-sm">
            {status === "saved" && <span className="text-emerald-600 dark:text-emerald-300">{t("portal.profile.saved")}</span>}
            {status === "error" && <span className="text-rose-600 dark:text-rose-300">{errorMessage}</span>}
          </div>
        </div>

        {!isVerified && (
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
            {t("portal.profile.verificationRequired")}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                {t("portal.profile.fullName")}
              </label>
              <input
                id="name"
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                disabled={!isVerified}
                className="w-full rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium">
                {t("portal.profile.username")}
              </label>
              <input
                id="username"
                value={form.username}
                onChange={(event) => setField("username", event.target.value)}
                disabled={!isVerified || usernameLocked}
                className="w-full rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
              />
              <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                {usernameLocked ? t("portal.profile.usernameLocked") : t("portal.profile.usernameClaim")}
              </p>
            </div>

            <div>
              <label htmlFor="jobTitle" className="mb-2 block text-sm font-medium">
                {t("portal.profile.jobTitle")}
              </label>
              <input
                id="jobTitle"
                value={form.jobTitle}
                onChange={(event) => setField("jobTitle", event.target.value)}
                disabled={!isVerified}
                className="w-full rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="company" className="mb-2 block text-sm font-medium">
                {t("portal.profile.company")}
              </label>
              <input
                id="company"
                value={form.company}
                onChange={(event) => setField("company", event.target.value)}
                disabled={!isVerified}
                className="w-full rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="location" className="mb-2 block text-sm font-medium">
                {t("portal.profile.location")}
              </label>
              <input
                id="location"
                value={form.location}
                onChange={(event) => setField("location", event.target.value)}
                disabled={!isVerified}
                className="w-full rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="website" className="mb-2 block text-sm font-medium">
                {t("portal.profile.website")}
              </label>
              <input
                id="website"
                value={form.website}
                onChange={(event) => setField("website", event.target.value)}
                disabled={!isVerified}
                placeholder={t("portal.profile.websitePlaceholder")}
                className="w-full rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">{t("portal.profile.avatar")}</label>
            <div
              onDragOver={(event) => {
                event.preventDefault();
                if (isVerified) setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition ${
                isDragging
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                  : "border-[var(--color-border-strong)] bg-[var(--color-surface-soft)]"
              } ${!isVerified ? "cursor-not-allowed opacity-60" : ""}`}
            >
              {form.image ? (
                <img
                  src={resolvePortalAvatarSrc(form.image) ?? undefined}
                  alt={t("portal.profile.avatar")}
                  className="h-20 w-20 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-primary),var(--color-accent))] text-xl font-semibold text-white">
                  {(form.name || user.email).slice(0, 1).toUpperCase()}
                </div>
              )}
              <p className="text-sm text-[var(--color-text-muted)]">
                {t("portal.profile.avatarDragDrop")}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!isVerified || uploadStatus === "uploading"}
                  className="rounded-full bg-[var(--color-primary)] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploadStatus === "uploading" ? t("portal.profile.uploading") : t("portal.profile.chooseImage")}
                </button>
                {form.image && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={!isVerified || uploadStatus === "uploading"}
                    className="rounded-full border border-[var(--color-border-strong)] px-5 py-2 text-xs font-semibold text-[var(--color-text-muted)] transition hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {t("portal.profile.remove")}
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                className="hidden"
                onChange={handleFileInputChange}
                disabled={!isVerified}
              />
              {uploadMessage && (
                <p
                  className={`text-xs ${
                    uploadStatus === "error" ? "text-rose-600 dark:text-rose-300" : "text-[var(--color-text-muted)]"
                  }`}
                >
                  {uploadMessage}
                </p>
              )}
            </div>

            <label htmlFor="image" className="mt-4 mb-2 block text-sm font-medium">
              {t("portal.profile.avatarUrl")}
            </label>
            <input
              id="image"
              value={form.image}
              onChange={(event) => setField("image", event.target.value)}
              disabled={!isVerified}
              placeholder={t("portal.profile.avatarUrlPlaceholder")}
              className="w-full rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
            />
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              {t("portal.profile.avatarUrlHint")}
            </p>
          </div>

          <div>
            <label htmlFor="bio" className="mb-2 block text-sm font-medium">
              {t("portal.profile.bio")}
            </label>
            <textarea
              id="bio"
              value={form.bio}
              onChange={(event) => setField("bio", event.target.value)}
              disabled={!isVerified}
              rows={6}
              className="w-full rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              type="submit"
              disabled={!isVerified || status === "saving"}
              className="rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "saving" ? t("portal.profile.saving") : t("portal.profile.saveProfile")}
            </button>
            <div className="rounded-full border border-[var(--color-border-strong)] px-5 py-3 text-sm text-[var(--color-text-muted)]">
              {t("portal.profile.emailChangeNote")}
            </div>
          </div>
        </form>

        <CentralProfileSections appProfiles={appProfiles} />
      </section>
    </div>
  );
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function prettyToken(value: string | null) {
  if (!value) return "Not set";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function StatTile({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 shadow-sm">
      <p className="truncate text-[9px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-0.5 text-2xl font-bold tabular-nums tracking-tight text-[var(--color-text)]">{value}</p>
    </div>
  );
}

function ChipList({ values }: { values: string[] }) {
  if (values.length === 0) {
    return <p className="text-sm text-[var(--color-text-muted)]">Not set</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <span
          key={value}
          className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-1 text-xs text-[var(--color-text-muted)]"
        >
          {value}
        </span>
      ))}
    </div>
  );
}

function ProfileBadge({ active, label }: { active: boolean; label: string }) {
  return active ? (
    <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-emerald-500/30 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
      {label}
    </span>
  ) : (
    <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-amber-500/30 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
      {label}
    </span>
  );
}

function AppCardHeader({
  appLabel,
  title,
  href,
  linkLabel,
  gradient,
}: {
  appLabel: string;
  title: string;
  href: string;
  linkLabel: string;
  gradient: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}>
          <span className="text-[10px] font-bold uppercase tracking-wider">{appLabel.slice(0, 2)}</span>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">{appLabel}</p>
          <h3 className="mt-0.5 text-lg font-semibold leading-tight tracking-tight text-[var(--color-text)]">{title}</h3>
        </div>
      </div>
      <a
        href={href}
        className="shrink-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[11px] font-semibold text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
      >
        {linkLabel} →
      </a>
    </div>
  );
}

function CentralProfileSections({
  appProfiles,
}: {
  appProfiles: CentralAppProfiles;
}) {
  const { t } = useTranslation();
  const edumatchUrl = process.env.NEXT_PUBLIC_EDUMATCH_URL || "http://localhost:3005";
  const viontoUrl = process.env.NEXT_PUBLIC_VIONTO_URL || "http://localhost:3006";
  const studentProfileUrl = `${edumatchUrl.replace(/\/$/, "")}/student/profile`;
  const tutorProfileUrl = `${edumatchUrl.replace(/\/$/, "")}/tutor/profile`;
  const { student, tutor, stats: eduStats } = appProfiles.edumatch;
  const { stats: viontoStats, recentProjects, usage } = appProfiles.vionto;

  return (
    <div className="mt-12">
      <div className="mb-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-[var(--color-border)]" />
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-text-muted)]">{t("portal.profile.apps.heading")}</p>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{t("portal.profile.apps.subheading")}</p>
        </div>
        <div className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      <div className="grid gap-6 2xl:grid-cols-2">
        {/* ── EduMatch ── */}
        <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-soft)] px-6 py-5">
            <AppCardHeader
              appLabel="EduMatch"
              title={t("portal.profile.apps.edumatch.title")}
              href={edumatchUrl}
              linkLabel={t("portal.profile.apps.open")}
              gradient="from-violet-500 to-indigo-600"
            />
          </div>

          <div className="p-6">
            <div className="grid grid-cols-4 gap-3">
              <StatTile label={t("portal.profile.apps.edumatch.stat.inquiries")} value={eduStats.inquiries} />
              <StatTile label={t("portal.profile.apps.edumatch.stat.quotes")} value={eduStats.quotes} />
              <StatTile label={t("portal.profile.apps.edumatch.stat.student")} value={eduStats.studentBookings} />
              <StatTile label={t("portal.profile.apps.edumatch.stat.tutor")} value={eduStats.tutorBookings} />
            </div>

            <div className="mt-5 grid gap-3">
              {/* Student card */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <p className="min-w-0 truncate font-semibold text-[var(--color-text)]">{t("portal.profile.apps.edumatch.student")}</p>
                  <ProfileBadge active={!!student} label={student ? t("portal.profile.apps.badge.active") : t("portal.profile.apps.badge.notSetUp")} />
                </div>
                {student ? (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--color-text-muted)]">{t("portal.profile.apps.edumatch.grade")}</span>
                      <span className="font-medium text-[var(--color-text)]">{prettyToken(student.gradeLevel)}</span>
                    </div>
                    <div>
                      <p className="mb-2 text-xs text-[var(--color-text-muted)]">{t("portal.profile.apps.edumatch.subjects")}</p>
                      <ChipList values={student.subjectsOfInterest} />
                    </div>
                    <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3">
                      <p className="text-xs text-[var(--color-text-muted)]">{t("portal.profile.apps.edumatch.updated").replace("{date}", formatDate(student.updatedAt))}</p>
                      <a href={studentProfileUrl} className="text-xs font-semibold text-[var(--color-primary)] hover:underline">{t("portal.profile.apps.edumatch.edit")} →</a>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 space-y-3">
                    <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                      {t("portal.profile.apps.edumatch.studentEmpty")}
                    </p>
                    <a
                      href={studentProfileUrl}
                      className="flex w-full items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      {t("portal.profile.apps.edumatch.studentCta")}
                    </a>
                  </div>
                )}
              </div>

              {/* Tutor card */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <p className="min-w-0 truncate font-semibold text-[var(--color-text)]">{t("portal.profile.apps.edumatch.tutor")}</p>
                  <ProfileBadge
                    active={!!tutor}
                    label={tutor ? (tutor.verifiedAt ? t("portal.profile.apps.badge.verified") : t("portal.profile.apps.badge.active")) : t("portal.profile.apps.badge.notSetUp")}
                  />
                </div>
                {tutor ? (
                  <div className="mt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                      <div>
                        <p className="text-xs text-[var(--color-text-muted)]">{t("portal.profile.apps.edumatch.rate")}</p>
                        <p className="font-medium text-[var(--color-text)]">{formatCurrency(tutor.hourlyRateCents)}/hr</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-text-muted)]">{t("portal.profile.apps.edumatch.mode")}</p>
                        <p className="font-medium text-[var(--color-text)]">
                          {tutor.onlineOnly
                            ? t("portal.profile.apps.edumatch.modeOnline")
                            : t("portal.profile.apps.edumatch.modeRadius").replace("{km}", String(tutor.serviceRadiusKm))}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-text-muted)]">{t("portal.profile.apps.edumatch.payouts")}</p>
                        <p className="font-medium text-[var(--color-text)]">
                          {tutor.payoutEnabled ? t("portal.profile.apps.edumatch.payoutsEnabled") : t("portal.profile.apps.edumatch.payoutsDisabled")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-text-muted)]">{t("portal.profile.apps.edumatch.rating")}</p>
                        <p className="font-medium text-[var(--color-text)]">
                          {tutor.ratingCount > 0 ? `${tutor.ratingAvg.toFixed(1)} ★` : t("portal.profile.apps.edumatch.noRatings")}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="mb-1.5 text-xs text-[var(--color-text-muted)]">{t("portal.profile.apps.edumatch.subjectsTaught")}</p>
                      <ChipList values={tutor.subjectsTaught} />
                    </div>
                    <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3">
                      <p className="text-xs text-[var(--color-text-muted)]">{t("portal.profile.apps.edumatch.updated").replace("{date}", formatDate(tutor.updatedAt))}</p>
                      <a href={tutorProfileUrl} className="text-xs font-semibold text-[var(--color-primary)] hover:underline">{t("portal.profile.apps.edumatch.edit")} →</a>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 space-y-3">
                    <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                      {t("portal.profile.apps.edumatch.tutorEmpty")}
                    </p>
                    <a
                      href={tutorProfileUrl}
                      className="flex w-full items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      {t("portal.profile.apps.edumatch.tutorCta")}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Vionto ── */}
        <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-soft)] px-6 py-5">
            <AppCardHeader
              appLabel="Vionto"
              title={t("portal.profile.apps.vionto.title")}
              href={viontoUrl}
              linkLabel={t("portal.profile.apps.open")}
              gradient="from-rose-500 to-orange-500"
            />
          </div>

          <div className="p-6">
            <div className="grid grid-cols-4 gap-3">
              <StatTile label={t("portal.profile.apps.vionto.stat.projects")} value={viontoStats.projects} />
              <StatTile label={t("portal.profile.apps.vionto.stat.assets")} value={viontoStats.assets} />
              <StatTile label={t("portal.profile.apps.vionto.stat.exports")} value={viontoStats.exports} />
              <StatTile label={t("portal.profile.apps.vionto.stat.shared")} value={viontoStats.sharedWithMe} />
            </div>

            <div className="mt-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
              <p className="font-semibold text-[var(--color-text)]">{t("portal.profile.apps.vionto.recentProjects")}</p>
              {recentProjects.length > 0 ? (
                <div className="mt-3 divide-y divide-[var(--color-border)]">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--color-text)]">{project.title}</p>
                        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                          {[prettyToken(project.mode), prettyToken(project.storyMode)].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                          {prettyToken(project.status)}
                        </span>
                        <span className="text-[10px] text-[var(--color-text-muted)]">{formatDate(project.updatedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                  {t("portal.profile.apps.vionto.projectsEmpty")}
                </p>
              )}
            </div>

            {usage.length > 0 && (
              <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
                <p className="font-semibold text-[var(--color-text)]">{t("portal.profile.apps.vionto.usage")}</p>
                <div className="mt-3 space-y-2">
                  {usage.map((metric) => (
                    <div key={`${metric.metric}-${metric.periodStart}`} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-[var(--color-text-muted)]">{prettyToken(metric.metric)}</span>
                      <span className="text-sm font-semibold tabular-nums text-[var(--color-text)]">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
