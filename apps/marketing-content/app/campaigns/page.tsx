import { SectionHeader } from "@/components/SectionHeader";
import { listCampaigns, getCurrentUserId } from "@/lib/campaigns";
import { NewCampaignButton } from "./NewCampaignButton";
import { CampaignsTable, type SortKey, type SortDir } from "./CampaignsTable";

export const dynamic = "force-dynamic";

const CHANNELS = ["seo", "email", "paid", "social", "partner"];
const STATUSES = ["live", "scheduled", "paused", "ended"];
const SORT_KEYS: SortKey[] = [
  "created", "name", "channel", "status", "owner",
  "budget", "spent", "conversions", "cpa", "progress", "started", "entries",
];

type SearchParams = Record<string, string | string[] | undefined>;

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const userId = await getCurrentUserId();
  const campaigns = await listCampaigns(userId);

  const channel = typeof sp.channel === "string" && CHANNELS.includes(sp.channel) ? sp.channel : "all";
  const status = typeof sp.status === "string" && STATUSES.includes(sp.status) ? sp.status : "all";
  const query = typeof sp.q === "string" ? sp.q : "";
  const sort: SortKey = typeof sp.sort === "string" && SORT_KEYS.includes(sp.sort as SortKey) ? (sp.sort as SortKey) : "created";
  const dir: SortDir = sp.dir === "desc" ? "desc" : "asc";

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Campaigns"
        title="Campaign performance"
        description="Cross-channel campaigns with owners, budget, and conversion signals. Filter, search, and sort the table, then click any row to view the full performance timeline."
        actions={<NewCampaignButton />}
      />

      <CampaignsTable
        campaigns={campaigns}
        initialChannel={channel}
        initialStatus={status}
        initialQuery={query}
        initialSort={sort}
        initialDir={dir}
      />

      {/* Hint */}
      <p className="text-center text-xs text-[var(--color-text-subtle)]">
        Click a campaign name or its entry count to open the performance timeline and log new data.
      </p>
    </div>
  );
}
