import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { getAuthedUser, unauthorized, badRequest, serverError } from "@/lib/server/auth";
import {
  createProjectSchema,
  paginationQuerySchema,
  formatZodError,
} from "@/lib/server/validation";

export const runtime = "nodejs";

const PROJECT_SELECT = {
  id: true,
  title: true,
  description: true,
  mode: true,
  storyMode: true,
  emotionalTone: true,
  visualStyle: true,
  musicOption: true,
  musicTrackId: true,
  musicMetadata: true,
  locale: true,
  aspectRatio: true,
  resolution: true,
  targetDurationSeconds: true,
  status: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { assets: true, scripts: true, exports: true } },
} as const;

/** GET /api/projects — list paginated projects the user owns OR has been shared with */
export async function GET(req: Request) {
  try {
    const user = await getAuthedUser();
    if (!user) return unauthorized();

    const { searchParams } = new URL(req.url);
    const parsed = paginationQuerySchema.safeParse({
      page: searchParams.get("page") ?? "1",
      pageSize: searchParams.get("pageSize") ?? "20",
      sortBy: searchParams.get("sortBy") ?? "createdAt",
      sortOrder: searchParams.get("sortOrder") ?? "desc",
    });
    if (!parsed.success) {
      return badRequest(formatZodError(parsed.error));
    }

    const { page, pageSize, sortBy, sortOrder } = parsed.data;
    const skip = (page - 1) * pageSize;
    const search = searchParams.get("search")?.trim() ?? "";

    // Match projects the user owns OR has a share record for (by userId or email)
    const accessWhere = {
      OR: [
        { userId: user.id },
        { shares: { some: { OR: [{ sharedWithUserId: user.id }, { email: user.email }] } } },
      ],
    };

    const titleFilter = search
      ? { title: { contains: search, mode: "insensitive" as const } }
      : {};

    const where = { ...accessWhere, ...titleFilter };

    const [projects, total] = await Promise.all([
      prisma.viontoProject.findMany({
        where,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: sortOrder },
        skip,
        take: pageSize,
        select: PROJECT_SELECT,
      }),
      prisma.viontoProject.count({ where }),
    ]);

    // Tag each project with the caller's relationship to it
    const enriched = projects.map((p) => ({
      ...p,
      isOwner: p.userId === user.id,
    }));

    return NextResponse.json({
      data: enriched,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    return serverError("projects", error);
  }
}

/** POST /api/projects — create a new project */
export async function POST(req: Request) {
  try {
    const user = await getAuthedUser();
    if (!user) return unauthorized();

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body.");
    }

    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(formatZodError(parsed.error));
    }

    const project = await prisma.viontoProject.create({
      data: {
        userId: user.id,
        ...parsed.data,
        status: "draft",
      },
      select: PROJECT_SELECT,
    });

    return NextResponse.json({ ...project, isOwner: true }, { status: 201 });
  } catch (error) {
    return serverError("projects", error);
  }
}
