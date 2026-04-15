"use client";

import { useState } from "react";
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

  const isVerified = Boolean(user.emailVerified);
  const usernameLocked = Boolean(user.username);

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

      await update();
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
            {form.image ? (
              <img src={form.image} alt={form.name || user.email} className="h-18 w-18 rounded-2xl object-cover" />
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
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Username policy</p>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Usernames are unique platform identifiers and become read-only once claimed.
              </p>
            </div>
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
            <label htmlFor="image" className="mb-2 block text-sm font-medium">
              Avatar URL
            </label>
            <input
              id="image"
              value={form.image}
              onChange={(event) => setField("image", event.target.value)}
              disabled={!isVerified}
              placeholder="https://..."
              className="w-full rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
            />
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
