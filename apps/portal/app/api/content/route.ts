import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";

export async function GET() {
  const sections = await prisma.siteContent.findMany({
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
  });

  const contentMap: Record<string, typeof sections[number]> = {};
  for (const s of sections) {
    contentMap[s.section] = s;
  }

  return NextResponse.json({ content: contentMap });
}
