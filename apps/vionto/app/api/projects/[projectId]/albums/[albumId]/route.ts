import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { getAuthedUser, unauthorized, badRequest, serverError } from "@/lib/server/auth";
import { updateAlbumSchema, formatZodError } from "@/lib/server/validation";
import { createPresignedDownloadUrl } from "@/lib/server/storage";

export const runtime = "nodejs";

type Params = { params: Promise<{ projectId: string; albumId: string }> };

async function getOwnedAlbum(albumId: string, projectId: string, userId: string) {
  return prisma.viontoAlbum.findFirst({
    where: { id: albumId, projectId, userId },
    select: {
      id: true,
      isBase: true,
      name: true,
      description: true,
      coverAssetId: true,
      metadata: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { items: true } },
    },
  });
}

/**
 * GET /api/projects/[projectId]/albums/[albumId]
 * Returns the album and its items (with presigned thumbnail URLs).
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await getAuthedUser();
    if (!user) return unauthorized();

    const { projectId, albumId } = await params;

    // Verify project ownership first.
    const projectExists = await prisma.viontoProject.findFirst({
      where: { id: projectId, userId: user.id },
      select: { id: true },
    });
    if (!projectExists) return badRequest("Project not found.");

    const album = await prisma.viontoAlbum.findFirst({
      where: { id: albumId, projectId },
      select: {
        id: true,
        projectId: true,
        userId: true,
        name: true,
        description: true,
        isBase: true,
        coverAssetId: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        items: {
          where: { hidden: false },
          orderBy: { orderIndex: "asc" },
          select: {
            id: true,
            assetId: true,
            orderIndex: true,
            metadata: true,
            hidden: true,
            favorite: true,
            createdAt: true,
            updatedAt: true,
            asset: {
              select: {
                id: true,
                storageKey: true,
                thumbnailStorageKey: true,
                originalUrl: true,
                thumbnailUrl: true,
                width: true,
                height: true,
                caption: true,
                orderIndex: true,
              },
            },
          },
        },
      },
    });

    if (!album) return badRequest("Album not found.");

    // Attach presigned URLs.
    const itemsWithUrls = await Promise.all(
      album.items.map(async (item) => {
        const originalUrl = item.asset.storageKey
          ? await createPresignedDownloadUrl(item.asset.storageKey, 10 * 60)
          : item.asset.originalUrl;
        const thumbnailUrl = item.asset.thumbnailStorageKey
          ? await createPresignedDownloadUrl(item.asset.thumbnailStorageKey, 10 * 60)
          : originalUrl;
        return { ...item, asset: { ...item.asset, originalUrl, thumbnailUrl } };
      })
    );

    return NextResponse.json({ ...album, items: itemsWithUrls });
  } catch (error) {
    return serverError("projects/[projectId]/albums/[albumId] GET", error);
  }
}

/**
 * PATCH /api/projects/[projectId]/albums/[albumId]
 * Rename/update album metadata. Base album name/description can be edited.
 */
export async function PATCH(req: Request, { params }: Params) {
  try {
    const user = await getAuthedUser();
    if (!user) return unauthorized();

    const { projectId, albumId } = await params;
    const album = await getOwnedAlbum(albumId, projectId, user.id);
    if (!album) return badRequest("Album not found.");

    const body = (await req.json().catch(() => null)) as unknown;
    const parsed = updateAlbumSchema.safeParse(body);
    if (!parsed.success) return badRequest(formatZodError(parsed.error));

    const updated = await prisma.viontoAlbum.update({
      where: { id: albumId },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.description !== undefined && { description: parsed.data.description }),
        ...(parsed.data.coverAssetId !== undefined && { coverAssetId: parsed.data.coverAssetId }),
        ...(parsed.data.metadata !== undefined && { metadata: parsed.data.metadata }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        isBase: true,
        coverAssetId: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { items: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return serverError("projects/[projectId]/albums/[albumId] PATCH", error);
  }
}

/**
 * DELETE /api/projects/[projectId]/albums/[albumId]
 * Deletes a derived album. The base album cannot be deleted.
 * Deleting an album does NOT delete source images.
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await getAuthedUser();
    if (!user) return unauthorized();

    const { projectId, albumId } = await params;
    const album = await getOwnedAlbum(albumId, projectId, user.id);
    if (!album) return badRequest("Album not found.");

    if (album.isBase) {
      return badRequest("The base album cannot be deleted.");
    }

    await prisma.viontoAlbum.delete({ where: { id: albumId } });

    return NextResponse.json({ ok: true, deletedAlbumId: albumId });
  } catch (error) {
    return serverError("projects/[projectId]/albums/[albumId] DELETE", error);
  }
}
