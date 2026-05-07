import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { getAuthedUser, unauthorized, badRequest, serverError } from "@/lib/server/auth";
import { createPresignedUploadUrl } from "@/lib/server/storage";

export const runtime = "nodejs";

/**
 * GET /api/exports/[exportId]/download
 *
 * Returns a time-limited signed download URL for a completed export.
 * Idempotent: multiple calls return new signed URLs.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ exportId: string }> }
) {
  try {
    const user = await getAuthedUser();
    if (!user) return unauthorized();

    const { exportId } = await params;

    const exportRecord = await prisma.viontoExport.findFirst({
      where: { id: exportId, userId: user.id },
      select: {
        id: true,
        storageKey: true,
        format: true,
        resolution: true,
        durationSeconds: true,
        fileSizeBytes: true,
        createdAt: true,
        renderJob: { select: { state: true } },
      },
    });

    if (!exportRecord) {
      return badRequest("Export not found.");
    }

    if (exportRecord.renderJob?.state !== "completed") {
      return NextResponse.json(
        { error: "Export is not ready for download yet.", state: exportRecord.renderJob?.state },
        { status: 425 }
      );
    }

    // In production, generate a presigned GET URL using the same S3 client
    // For now, return a stub URL and metadata
    const downloadUrl = `https://cdn.asafarim.com/${exportRecord.storageKey}?token=stub`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.viontoExport.update({
      where: { id: exportId },
      data: {
        signedUrl: downloadUrl,
        signedUrlExpiresAt: expiresAt,
      },
    });

    return NextResponse.json({
      exportId,
      downloadUrl,
      expiresAt: expiresAt.toISOString(),
      format: exportRecord.format,
      resolution: exportRecord.resolution,
      durationSeconds: exportRecord.durationSeconds,
      fileSizeBytes: exportRecord.fileSizeBytes,
    });
  } catch (error) {
    return serverError("exports/[exportId]/download", error);
  }
}
