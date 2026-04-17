"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function AutomationToggle({ id, enabled, canWrite }: { id: string; enabled: boolean; canWrite: boolean }) {
  const [on, setOn] = useState(enabled);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function toggle() {
    if (!canWrite || pending) return;
    const next = !on;
    setOn(next);
    setError(null);
    const res = await fetch(`/api/automations/${id}/toggle`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isEnabled: next }),
    });
    if (!res.ok) {
      setOn(!next);
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={!canWrite || pending}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          on ? "bg-emerald-500/70" : "bg-white/10"
        } ${canWrite ? "cursor-pointer hover:brightness-110" : "cursor-not-allowed opacity-60"}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
            on ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
      {error && <span className="text-[10px] text-rose-400">{error}</span>}
    </div>
  );
}
