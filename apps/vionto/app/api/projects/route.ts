import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { getAuthedUser, unauthorized, badRequest, serverError } from "@/lib/server/auth";
import {
  createProjectSchema,
  paginationQuerySchema,
  formatZodError,
} from "@/lib/server/validation";

export const runtime = "nodejs";

/** GET /api/projects — list paginated projects for the authenticated user */
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

    const where = { userId: user.id };

    const [projects, total] = await Promise.all([
      prisma.viontoProject.findMany({
        where,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: sortOrder },
        skip,
        take: pageSize,
        select: {
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
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { assets: true, scripts: true, exports: true } },
        },
      }),
      prisma.viontoProject.count({ where }),
    ]);

    return NextResponse.json({
      data: projects,
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
      select: {
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
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return serverError("projects", error);
  }
}
