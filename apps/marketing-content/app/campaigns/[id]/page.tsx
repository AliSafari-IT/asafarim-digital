import { notFound } from "next/navigation";
import { getCampaign, listEntries, getCurrentUserId } from "@/lib/campaigns";
import { CampaignDetail } from "./CampaignDetail";

export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await getCurrentUserId();

  const campaign = await getCampaign(id, userId);
  if (!campaign) notFound();

  const entries = await listEntries(id, userId);

  return <CampaignDetail campaign={campaign} initialEntries={entries} />;
}
