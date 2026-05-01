import { NextResponse } from "next/server";
import { requireAuth, unauthorized } from "@/lib/server/auth";
import { serverError } from "@/lib/server";
import { findBestTutors } from "@/lib/server/tutor-matching";

export const runtime = "nodejs";

/**
 * POST /api/admin/tutor-matching/debug
 *
 * Admin-only endpoint to test tutor matching algorithm.
 * Requires the user to have the `edumatch_admin` role.
 */
export async function POST(req: Request) {
  try {
    const user = await requireAuth();

    // Check for edumatch_admin role
    if (!user.roles.includes("edumatch_admin")) {
      return unauthorized();
    }

    const body = (await req.json().catch(() => ({}))) as {
      lat?: number;
      lng?: number;
      subject?: string;
      gradeLevel?: string;
      maxDistanceKm?: number;
      preferOnline?: boolean;
      limit?: number;
    };

    const { lat, lng, subject, gradeLevel, maxDistanceKm, preferOnline, limit } = body;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ error: "Invalid lat/lng" }, { status: 400 });
    }
    if (!subject || !gradeLevel) {
      return NextResponse.json({ error: "Subject and gradeLevel required" }, { status: 400 });
    }

    const tutors = await findBestTutors({
      studentLocation: { lat, lng },
      subject,
      gradeLevel,
      maxDistanceKm: maxDistanceKm ?? 50,
      preferOnline: preferOnline ?? false,
      limit: limit ?? 20,
    });

    return NextResponse.json({ tutors });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return unauthorized();
    return serverError("admin/tutor-matching/debug", error);
  }
}
