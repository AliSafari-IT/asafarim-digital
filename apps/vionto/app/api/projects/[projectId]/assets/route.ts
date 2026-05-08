import { NextResponse } from "next/server";
import { Prisma, prisma } from "@asafarim/db";
import { getAuthedUser, unauthorized, badRequest, serverError } from "@/lib/server/auth";
import { formatZodError, promoteSessionSchema } from "@/lib/server/validation";
import { getSessionForUser, deleteSession } from "@/lib/server/upload-session";

export const runtime = "nodejs";

async function getProject(projectId: string, userId: string) {
  return prisma.viontoProject.findFirst({
    where: { id: projectId, userId },
    select: {
      id: true,
      title: true,
      description: true,
      mode: true,
      locale: true,
      aspectRatio: true,
      resolution: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/** GET /api/projects/[projectId]/assets — list assets for a project */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getAuthedUser();
    if (!user) return unauthorized();

    const { projectId } = await params;
    const project = await getProject(projectId, user.id);
    if (!project) {
      return badRequest("Project not found.");
    }

    const assets = await prisma.viontoAsset.findMany({
      where: { projectId },
      orderBy: { orderIndex: "asc" },
      select: {
        id: true,
        projectId: true,
        userId: true,
        type: true,
        originalUrl: true,
        thumbnailUrl: true,
        storageKey: true,
        thumbnailStorageKey: true,
        width: true,
        height: true,
        fileSizeBytes: true,
        orderIndex: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ assets });
  } catch (error) {
    return serverError("projects/[projectId]/assets", error);
  }
}

/** POST /api/projects/[projectId]/assets — promote session assets to project */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getAuthedUser();
    if (!user) return unauthorized();

    const { projectId } = await params;
    const project = await getProject(projectId, user.id);
    if (!project) {
      return badRequest("Project not found.");
    }

    const body = (await req.json().catch(() => null)) as unknown;
    const parsed = promoteSessionSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(formatZodError(parsed.error));
    }

    const { sessionId, orderedKeys, clearSession = true } = parsed.data;

    // Get session and validate ownership
    const session = getSessionForUser(sessionId, user.id);
    if (!session) {
      return badRequest("Invalid or expired upload session");
    }

    // Determine order
    let orderedAssets = session.assets;
    if (orderedKeys && orderedKeys.length > 0) {
      const keyMap = new Map(session.assets.map((a) => [a.key, a]));
      orderedAssets = orderedKeys
        .map((k) => keyMap.get(k))
        .filter(Boolean) as typeof session.assets;
    }

    if (orderedAssets.length === 0) {
      return badRequest("No assets in session to promote");
    }

    // Create ViontoAsset records
    const createdAssets = await prisma.viontoAsset.createMany({
      data: orderedAssets.map((asset, idx) => ({
        projectId,
        userId: user.id,
        type: "source_image",
        originalUrl: asset.publicUrl,
        thumbnailUrl: asset.thumbnailUrl ?? asset.publicUrl, // fallback to original
        storageKey: asset.key,
        thumbnailStorageKey: asset.thumbnailKey ?? asset.key, // fallback to original
        width: asset.width,
        height: asset.height,
        fileSizeBytes: asset.sizeBytes,
        orderIndex: idx,
        metadata: asset.exif ? ({ exif: asset.exif } as Prisma.InputJsonObject) : Prisma.JsonNull,
      })),
    });

    // Optionally clear the session
    if (clearSession) {
      deleteSession(sessionId);
    }

    // Fetch the created assets to return full objects
    const assets = await prisma.viontoAsset.findMany({
      where: { projectId },
      orderBy: { orderIndex: "asc" },
      select: {
        id: true,
        projectId: true,
        userId: true,
        type: true,
        originalUrl: true,
        thumbnailUrl: true,
        storageKey: true,
        thumbnailStorageKey: true,
        width: true,
        height: true,
        fileSizeBytes: true,
        orderIndex: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      promotedCount: createdAssets.count,
      assets,
    });
  } catch (error) {
    return serverError("projects/[projectId]/assets", error);
  }
}
