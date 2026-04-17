export function formatMoney(cents: number, currency = "USD"): string {
  const value = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function formatRelative(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  const diffMs = Date.now() - date.getTime();
  const future = diffMs < 0;
  const diff = Math.abs(diffMs);
  const mins = Math.floor(diff / 60_000);
  const hrs = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  let out: string;
  if (mins < 1) out = "just now";
  else if (mins < 60) out = `${mins}m`;
  else if (hrs < 24) out = `${hrs}h`;
  else if (days < 30) out = `${days}d`;
  else out = `${Math.floor(days / 30)}mo`;
  return future ? `in ${out}` : `${out} ago`;
}
