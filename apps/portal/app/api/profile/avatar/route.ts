import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { auth } from "@asafarim/auth";
import { prisma } from "@asafarim/db";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED = new Map<string, string>([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/svg+xml", "svg"],
]);

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, emailVerified: true },
  });

  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!currentUser.emailVerified) {
    return NextResponse.json(
      { error: "Verify your email before changing profile details" },
      { status: 403 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = ALLOWED.get(file.type);
  if (!ext) {
    return NextResponse.json(
      { error: "Unsupported image type. Use PNG, JPEG, WEBP, GIF, or SVG." },
      { status: 415 }
    );
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: "File is empty" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds 2MB limit" }, { status: 413 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${currentUser.id}-${randomUUID()}.${ext}`;
  const target = path.join(uploadsDir, filename);
  await writeFile(target, bytes);

  const publicUrl = `/uploads/avatars/${filename}`;

  const updated = await prisma.user.update({
    where: { id: currentUser.id },
    data: { image: publicUrl },
    select: { image: true },
  });

  return NextResponse.json({ image: updated.image });
}

export async function DELETE() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, emailVerified: true },
  });

  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!currentUser.emailVerified) {
    return NextResponse.json(
      { error: "Verify your email before changing profile details" },
      { status: 403 }
    );
  }

  await prisma.user.update({
    where: { id: currentUser.id },
    data: { image: null },
  });

  return NextResponse.json({ image: null });
}
