import { redirect } from "next/navigation";

const localTargetUrl = process.env.LOCAL_MARKETING_CONTENT_URL ?? "http://localhost:3004";
const qaTargetUrl = "https://marketing-content.asafarim.com";

export default function MarketingContentRedirectPage() {
  const targetUrl =
    process.env.NODE_ENV === "development"
      ? localTargetUrl
      : process.env.MARKETING_CONTENT_URL ?? process.env.NEXT_PUBLIC_MARKETING_CONTENT_URL ?? qaTargetUrl;

  redirect(targetUrl);
}
