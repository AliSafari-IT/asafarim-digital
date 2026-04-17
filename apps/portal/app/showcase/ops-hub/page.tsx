import { redirect } from "next/navigation";

const localTargetUrl = process.env.LOCAL_OPS_HUB_URL ?? "http://localhost:3003";
const qaTargetUrl = "https://ops-hub.asafarim.com";

export default function OpsHubRedirectPage() {
  const targetUrl =
    process.env.NODE_ENV === "development"
      ? localTargetUrl
      : process.env.OPS_HUB_URL ?? process.env.NEXT_PUBLIC_OPS_HUB_URL ?? qaTargetUrl;

  redirect(targetUrl);
}
