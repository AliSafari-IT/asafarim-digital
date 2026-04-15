import { prisma } from "@asafarim/db";
import { HomeContent } from "./home-content";

export const dynamic = "force-dynamic";

export default async function PortalHome() {
  const sections = await prisma.siteContent
    .findMany({
      where: { isPublished: true },
      orderBy: { position: "asc" },
      select: {
        section: true,
        title: true,
        subtitle: true,
        eyebrow: true,
        body: true,
        metadata: true,
      },
    })
    .catch((error) => {
      console.error("Failed to load homepage CMS content", error);
      return [];
    });

  // Build a section-keyed map for the client component
  const content: Record<string, (typeof sections)[number]> = {};
  for (const s of sections) {
    content[s.section] = s;
  }

  return <HomeContent content={content} />;
}
