/**
 * GET /api/user/location - List current user's locations
 * POST /api/user/location - Create a new location
 *
 * Query params (GET):
 * - type: home|work|billing|shipping|other
 * - appScope: filter by app (e.g., "edumatch")
 * - primary: true|false - only primary locations
 * - country: ISO country code
 * - city: partial match (case-insensitive)
 * - limit: max results (default 50)
 */

import { NextResponse } from "next/server";
import { auth } from "@asafarim/auth";
import { prisma } from "@asafarim/db";
import {
  CreateLocationSchema,
  createLocation,
  listLocations,
  type LocationType,
} from "@asafarim/location";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get("type");
    const type = typeParam as LocationType | null;
    const appScope = searchParams.get("appScope") ?? undefined;
    const primaryParam = searchParams.get("primary");
    const isPrimary =
      primaryParam === "true" ? true : primaryParam === "false" ? false : undefined;
    const country = searchParams.get("country") ?? undefined;
    const city = searchParams.get("city") ?? undefined;
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);

    const locations = await listLocations(prisma, session.user.id, {
      type: type ?? undefined,
      appScope,
      country,
      city,
      isPrimary,
      limit,
    });

    return NextResponse.json({ locations, total: locations.length });
  } catch (error) {
    console.error("[GET /api/user/location] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = CreateLocationSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const location = await createLocation(prisma, session.user.id, parsed.data);
    return NextResponse.json({ location }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/user/location] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to create location";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
