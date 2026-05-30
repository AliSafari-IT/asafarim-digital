"use client";

import { useState } from "react";
import { CampaignForm } from "./CampaignForm";

export function NewCampaignButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white hover:brightness-110"
      >
        + New campaign
      </button>
      <CampaignForm mode="create" open={open} onClose={() => setOpen(false)} />
    </>
  );
}
