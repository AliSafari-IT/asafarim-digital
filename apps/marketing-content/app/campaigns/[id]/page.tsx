import { notFound } from "next/navigation";
import { campaigns, performanceEntries } from "@/lib/demo-data";
import { CampaignDetail } from "./CampaignDetail";

export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = campaigns.find((c) => c.id === id);
  if (!campaign) notFound();

  const entries = performanceEntries
    .filter((e) => e.campaignId === id)
    .sort((a, b) => a.weekOf.localeCompare(b.weekOf));

  return <CampaignDetail campaign={campaign} initialEntries={entries} />;
}
