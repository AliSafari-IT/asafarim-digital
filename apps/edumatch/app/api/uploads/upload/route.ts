import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/server/profiles";
import { handleEduError } from "@/lib/server";
import { badRequest, serverError } from "@/lib/server/auth";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_BYTES,
  MIN_FILE_BYTES,
  type AllowedMime,
} from "@/lib/server/validation";
import { createPresignedUploadUrl } from "@/lib/server/storage";

export const runtime = "nodejs";

/**
 * POST /api/uploads/upload
 *
 * Accepts a multipart/form-data body with a single "file" field.
 * Presigns a storage URL server-side, PUTs the bytes from the server
 * (avoiding any browser CORS requirement), and returns the attachment
 * descriptor ready for the inquiry intake payload.
 *
 * The browser only ever talks to our own origin — no cross-origin PUT.
 */
export async function POST(req: Request) {
  try {
    const { user } = await requireStudent();

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return badRequest("Invalid multipart body");
    }

    const fileEntry = formData.get("file");
    if (!(fileEntry instanceof File)) return badRequest("No file in request");

    const file = fileEntry;

    if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMime)) {
      return badRequest(`Unsupported file type: ${file.type}`);
    }
    if (file.size > MAX_FILE_BYTES) return badRequest("File exceeds 50 MB limit");
    if (file.size < MIN_FILE_BYTES) return badRequest("File is empty");

    const presigned = await createPresignedUploadUrl({
      userId: user.id,
      filename: file.name,
      contentType: file.type as AllowedMime,
      sizeBytes: file.size,
    });

    if (!presigned.isLocalStub) {
      const buffer = await file.arrayBuffer();
      const putRes = await fetch(presigned.uploadUrl, {
        method: "PUT",
        headers: presigned.headers,
        body: buffer,
      });
      if (!putRes.ok) {
        throw new Error(
          `Storage PUT failed: ${putRes.status} ${putRes.statusText}`,
        );
      }
    }

    return NextResponse.json({
      key: presigned.key,
      url: presigned.publicUrl,
      mime: file.type,
      sizeBytes: file.size,
      filename: file.name,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "EduAuthError") {
      return handleEduError("uploads/upload", error);
    }
    return serverError("uploads/upload", error);
  }
}
