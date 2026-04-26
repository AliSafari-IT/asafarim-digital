import { NextResponse } from "next/server";

import {
  badRequest,
  getAuthedUser,
  serverError,
  unauthorized,
} from "@/lib/server/auth";
import {
  createContentType,
  getAvailableContentTypes,
  toContentTypeDto,
} from "@/lib/server/content-types";

export async function GET() {
  const user = await getAuthedUser();
  if (!user) return unauthorized();

  try {
    const rows = await getAvailableContentTypes(user);
    return NextResponse.json({ contentTypes: rows.map(toContentTypeDto) });
  } catch (error) {
    return serverError("content-types.GET", error);
  }
}

export async function POST(request: Request) {
  const user = await getAuthedUser();
  if (!user) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  try {
    const result = await createContentType(user, (body ?? {}) as Record<string, unknown>);
    if (!result.ok) {
      const status = "status" in result && result.status ? result.status : 400;
      return NextResponse.json({ error: result.error }, { status });
    }
    return NextResponse.json(
      { contentType: toContentTypeDto(result.row) },
      { status: 201 },
    );
  } catch (error) {
    return serverError("content-types.POST", error);
  }
}
