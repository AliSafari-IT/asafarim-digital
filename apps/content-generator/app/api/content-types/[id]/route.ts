import { NextResponse } from "next/server";

import {
  badRequest,
  getAuthedUser,
  notFound,
  serverError,
  unauthorized,
} from "@/lib/server/auth";
import {
  deleteContentType,
  toContentTypeDto,
  updateContentType,
} from "@/lib/server/content-types";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const user = await getAuthedUser();
  if (!user) return unauthorized();

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  try {
    const updated = await updateContentType(
      user,
      id,
      (body ?? {}) as Record<string, unknown>,
    );
    if (!updated) return notFound();
    return NextResponse.json({ contentType: toContentTypeDto(updated) });
  } catch (error) {
    return serverError("content-types.PATCH", error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getAuthedUser();
  if (!user) return unauthorized();

  const { id } = await params;

  try {
    const deleted = await deleteContentType(user, id);
    if (!deleted) return notFound();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError("content-types.DELETE", error);
  }
}
