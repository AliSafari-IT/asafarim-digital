import { NextResponse } from "next/server";
import { getAuthedUser, badRequest, serverError, unauthorized } from "@/lib/server/auth";
import { formatZodError, uploadCompleteSchema } from "@/lib/server/validation";
import { objectExists, isKeyOwnedBy } from "@/lib/server/storage";
import { addAssetToSession, getSessionForUser } from "@/lib/server/upload-session";

export const runtime = "nodejs";

/**
 * POST /api/uploads/complete
 *
 * Notify the server that a presigned upload finished. Validates ownership,
 * confirms the object exists in storage, and stages the asset in the upload
 * session. Returns staged asset metadata (including any extracted EXIF).
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthedUser();
    if (!user) return unauthorized();

    const body = (await req.json().catch(() => null)) as unknown;
    const parsed = uploadCompleteSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(formatZodError(parsed.error));
    }

    const { key, sessionId, metadata } = parsed.data;

    // Ownership check
    if (!isKeyOwnedBy(key, user.id)) {
      return badRequest("Upload key does not belong to the authenticated user");
    }

    // Session ownership check
    const session = getSessionForUser(sessionId, user.id);
    if (!session) {
      return badRequest("Invalid or expired upload session");
    }

    // Confirm object exists in storage (skipped in local-dev stub mode)
    const exists = await objectExists(key);
    if (!exists) {
      return badRequest("Uploaded object not found in storage — upload may have failed");
    }

    // Stage the asset in the session
    const staged = addAssetToSession(sessionId, {
      key,
      publicUrl: metadata.filename, // client should replace with actual public URL
      filename: metadata.filename,
      contentType: metadata.contentType,
      sizeBytes: metadata.sizeBytes,
      width: metadata.width,
      height: metadata.height,
      exif: metadata.exif,
      uploadedAt: new Date(),
    });

    if (!staged) {
      return badRequest("Failed to stage asset — session may have expired");
    }

    return NextResponse.json({
      success: true,
      sessionId,
      asset: staged.assets[staged.assets.length - 1],
      totalAssets: staged.assets.length,
    });
  } catch (error) {
    return serverError("uploads/complete", error);
  }
}
