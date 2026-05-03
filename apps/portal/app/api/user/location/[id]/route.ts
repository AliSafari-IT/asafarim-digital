/**
 * GET /api/user/location/[id] - Get a specific location
 * PATCH /api/user/location/[id] - Update a location
 * DELETE /api/user/location/[id] - Delete a location
 */

import { NextResponse } from "next/server";
import { auth } from "@asafarim/auth";
import { prisma } from "@asafarim/db";
import {
  UpdateLocationSchema,
  getLocation,
  updateLocation,
  deleteLocation,
} from "@asafarim/location";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const location = await getLocation(prisma, session.user.id, id);

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    return NextResponse.json({ location });
  } catch (error) {
    console.error("[GET /api/user/location/[id]] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch location" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = UpdateLocationSchema.safeParse({ ...body, id });

    if (!parsed.success) {
      const errors = parsed.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const location = await updateLocation(prisma, session.user.id, parsed.data);
    return NextResponse.json({ location });
  } catch (error) {
    console.error("[PATCH /api/user/location/[id]] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to update location";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await deleteLocation(prisma, session.user.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/user/location/[id]] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete location";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
