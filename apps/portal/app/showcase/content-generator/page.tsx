import { redirect } from "next/navigation";

const localTargetUrl = process.env.LOCAL_CONTENT_GENERATOR_URL ?? "http://localhost:3001";
const qaTargetUrl = "https://content-generator-qa.asafarim.com";

export default function ContentGeneratorRedirectPage() {
  const targetUrl =
    process.env.NODE_ENV === "development"
      ? localTargetUrl
      : process.env.CONTENT_GENERATOR_URL ?? process.env.NEXT_PUBLIC_CONTENT_GENERATOR_URL ?? qaTargetUrl;

  redirect(targetUrl);
}
