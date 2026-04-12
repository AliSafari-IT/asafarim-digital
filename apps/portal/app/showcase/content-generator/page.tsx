import { redirect } from "next/navigation";

const fallbackUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : "https://content-generator-qa.asafarim.com";

export default function ContentGeneratorRedirectPage() {
  const targetUrl =
    process.env.CONTENT_GENERATOR_URL ??
    process.env.NEXT_PUBLIC_CONTENT_GENERATOR_URL ??
    fallbackUrl;

  redirect(targetUrl);
}
