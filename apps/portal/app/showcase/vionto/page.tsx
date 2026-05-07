import { redirect } from "next/navigation";

const localTargetUrl = process.env.LOCAL_VIONTO_URL ?? "http://localhost:3006";
const prodTargetUrl = "https://vionto.asafarim.com";

export default function ViontoRedirectPage() {
  const targetUrl =
    process.env.NODE_ENV === "development"
      ? localTargetUrl
      : process.env.VIONTO_URL ?? process.env.NEXT_PUBLIC_VIONTO_URL ?? prodTargetUrl;

  redirect(targetUrl);
}
