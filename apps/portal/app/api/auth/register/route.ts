import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { hashPassword } from "@asafarim/auth";

function normalizeUsername(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function POST(request: Request) {
  try {
    const { name, username, email, password } = await request.json();

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = normalizeUsername(username);

    if (normalizedUsername.length < 3 || normalizedUsername.length > 24) {
      return NextResponse.json(
        { error: "Username must be between 3 and 24 characters" },
        { status: 400 }
      );
    }

    const [existingEmail, existingUsername] = await Promise.all([
      prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
      }),
      prisma.user.findUnique({
        where: { username: normalizedUsername },
        select: { id: true },
      }),
    ]);

    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    if (existingUsername) {
      return NextResponse.json(
        { error: "This username is already taken" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    // Find default role (guest)
    const defaultRole = await prisma.role.findFirst({ where: { isDefault: true } });

    const user = await prisma.user.create({
      data: {
        name: name?.trim() || null,
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
        ...(defaultRole
          ? { userRoles: { create: { roleId: defaultRole.id } } }
          : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        emailVerified: true,
      },
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? message : "Internal server error" },
      { status: 500 }
    );
  }
}
