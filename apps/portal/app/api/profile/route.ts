import { NextResponse } from "next/server";
import { auth } from "@asafarim/auth";
import { prisma } from "@asafarim/db";

function normalizeOptionalText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function normalizeUsername(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!normalized) return null;
  return normalized;
}

function normalizeWebsite(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    return url.toString();
  } catch {
    return null;
  }
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
      jobTitle: true,
      company: true,
      website: true,
      location: true,
      bio: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      emailVerified: true,
    },
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

  const payload = await request.json();
  const requestedUsername = normalizeUsername(payload.username);

  if (payload.username !== undefined) {
    if (!requestedUsername || requestedUsername.length < 3 || requestedUsername.length > 24) {
      return NextResponse.json(
        { error: "Username must be between 3 and 24 characters" },
        { status: 400 }
      );
    }

    if (currentUser.username && requestedUsername !== currentUser.username) {
      return NextResponse.json(
        { error: "Username cannot be changed once set" },
        { status: 400 }
      );
    }

    if (!currentUser.username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: requestedUsername },
        select: { id: true },
      });

      if (existingUsername && existingUsername.id !== currentUser.id) {
        return NextResponse.json(
          { error: "This username is already taken" },
          { status: 409 }
        );
      }
    }
  }

  const data = {
    name: normalizeOptionalText(payload.name, 80),
    jobTitle: normalizeOptionalText(payload.jobTitle, 80),
    company: normalizeOptionalText(payload.company, 80),
    website: payload.website === undefined ? undefined : normalizeWebsite(payload.website),
    location: normalizeOptionalText(payload.location, 80),
    bio: normalizeOptionalText(payload.bio, 500),
    image: payload.image === undefined ? undefined : normalizeOptionalText(payload.image, 300),
    ...(currentUser.username ? {} : { username: requestedUsername }),
  };

  if (payload.website !== undefined && payload.website && !data.website) {
    return NextResponse.json(
      { error: "Website must be a valid URL" },
      { status: 400 }
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: currentUser.id },
    data,
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
      jobTitle: true,
      company: true,
      website: true,
      location: true,
      bio: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ user: updatedUser });
}
