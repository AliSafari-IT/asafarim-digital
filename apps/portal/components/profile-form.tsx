"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";

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

function resolvePortalAvatarSrc(src?: string | null) {
  if (!src) return null;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/api/uploads/avatars/")) return src;
  if (src.startsWith("/uploads/avatars/")) {
    return src.replace("/uploads/avatars/", "/api/uploads/avatars/");
  }
  return src;
}

export function ProfileForm({ user }: { user: ProfileData }) {
  const { update } = useSession();
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
        setVerifyMessage(data.error || "Could not send verification email.");
        return;
      }
      setVerifyStatus("sent");
      setVerifyMessage(data.message || "Verification email sent. Check your inbox.");
    } catch {
      setVerifyStatus("error");
      setVerifyMessage("Network error while sending verification email.");
    }
  }

  async function uploadAvatarFile(file: File) {
    if (!isVerified) {
      setUploadStatus("error");
      setUploadMessage("Verify your email before uploading an avatar.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setUploadStatus("error");
      setUploadMessage("Only image files are allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadStatus("error");
      setUploadMessage("Image exceeds the 2MB limit.");
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
        setUploadMessage(data.error || "Could not upload image.");
        return;
      }
      setField("image", data.image);
      setUploadStatus("idle");
      setUploadMessage("");
      await update({ image: data.image });
    } catch {
      setUploadStatus("error");
      setUploadMessage("Network error while uploading.");
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
        setUploadMessage(data.error || "Could not remove image.");
        return;
      }
      setField("image", "");
      setUploadStatus("idle");
      await update({ image: null });
    } catch {
      setUploadStatus("error");
      setUploadMessage("Network error while removing image.");
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
        setErrorMessage(data.error || "Unable to update your profile");
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
      setErrorMessage("Something went wrong while saving");
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">Profile Control</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">Your account profile</h1>
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
              <h2 className="text-xl font-semibold">{form.name || "Unnamed profile"}</h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">@{form.username || "claim-your-name"}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Email</p>
              <p className="mt-2 text-sm">{user.email}</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Verification</p>
              <p className={`mt-2 text-sm ${isVerified ? "text-emerald-300" : "text-amber-300"}`}>
                {isVerified ? "Email verified. Profile edits are enabled." : "Verify your email before changing profile details."}
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
                      ? "Sending..."
                      : verifyStatus === "sent"
                        ? "Verification email sent"
                        : "Send verification email"}
                  </button>
                  {verifyMessage && (
                    <p
                      className={`text-xs ${
                        verifyStatus === "error" ? "text-rose-300" : "text-[var(--color-text-muted)]"
                      }`}
                    >
                      {verifyMessage}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Username policy</p>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Usernames are unique platform identifiers and become read-only once claimed.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyUserId}
              className="group flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3 text-left transition hover:border-[var(--color-primary)]/50"
            >
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">User ID</p>
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
          </div>

          <div className="mt-8 space-y-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Quick Links</p>
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
              Sign out
            </a>
          </div>
        </div>
      </aside>

      <section className="rounded-[2rem] border border-[var(--color-border-strong)] bg-[var(--color-panel)] p-8 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">Profile Settings</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">Update your public and operational details</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-text-muted)]">
              This form is structured so future sections like password management, connected accounts, notification settings, and tenant preferences can be added cleanly.
            </p>
          </div>

          <div className="text-sm">
            {status === "saved" && <span className="text-emerald-300">Profile saved</span>}
            {status === "error" && <span className="text-rose-300">{errorMessage}</span>}
          </div>
        </div>

        {!isVerified && (
          <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
            Email verification is required before profile details can be changed. This guard is enforced on the server, not just in the UI.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Full name
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
                Username
              </label>
              <input
                id="username"
                value={form.username}
                onChange={(event) => setField("username", event.target.value)}
                disabled={!isVerified || usernameLocked}
                className="w-full rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
              />
              <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                {usernameLocked ? "This username is locked after registration." : "For legacy accounts without a username, you can claim one once."}
              </p>
            </div>

            <div>
              <label htmlFor="jobTitle" className="mb-2 block text-sm font-medium">
                Job title
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
                Company
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
                Location
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
                Website
              </label>
              <input
                id="website"
                value={form.website}
                onChange={(event) => setField("website", event.target.value)}
                disabled={!isVerified}
                placeholder="https://example.com"
                className="w-full rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Avatar</label>
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
                  alt="Avatar preview"
                  className="h-20 w-20 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-primary),var(--color-accent))] text-xl font-semibold text-white">
                  {(form.name || user.email).slice(0, 1).toUpperCase()}
                </div>
              )}
              <p className="text-sm text-[var(--color-text-muted)]">
                Drag and drop an image here, or pick a file. PNG, JPEG, WEBP, GIF, SVG up to 2MB.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!isVerified || uploadStatus === "uploading"}
                  className="rounded-full bg-[var(--color-primary)] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploadStatus === "uploading" ? "Uploading..." : "Choose image"}
                </button>
                {form.image && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={!isVerified || uploadStatus === "uploading"}
                    className="rounded-full border border-[var(--color-border-strong)] px-5 py-2 text-xs font-semibold text-[var(--color-text-muted)] transition hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Remove
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
                    uploadStatus === "error" ? "text-rose-300" : "text-[var(--color-text-muted)]"
                  }`}
                >
                  {uploadMessage}
                </p>
              )}
            </div>

            <label htmlFor="image" className="mt-4 mb-2 block text-sm font-medium">
              Avatar URL
            </label>
            <input
              id="image"
              value={form.image}
              onChange={(event) => setField("image", event.target.value)}
              disabled={!isVerified}
              placeholder="https://... or /api/uploads/avatars/..."
              className="w-full rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
            />
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              You can still paste an external URL. Uploading a file replaces this value automatically.
            </p>
          </div>

          <div>
            <label htmlFor="bio" className="mb-2 block text-sm font-medium">
              Bio
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
              {status === "saving" ? "Saving..." : "Save profile"}
            </button>
            <div className="rounded-full border border-[var(--color-border-strong)] px-5 py-3 text-sm text-[var(--color-text-muted)]">
              Email changes should ship as a separate verified flow, not as an unguarded text field.
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
