import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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

type Attribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrer?: string;
  landingPage?: string;
};

async function readAttribution(): Promise<Attribution> {
  try {
    const store = await cookies();
    const raw = store.get("asafarim-attr")?.value;
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Attribution;
    // Whitelist fields and clip length
    const clip = (v?: string, max = 250) =>
      typeof v === "string" && v.length > 0 ? v.slice(0, max) : undefined;
    return {
      utmSource: clip(parsed.utmSource, 200),
      utmMedium: clip(parsed.utmMedium, 200),
      utmCampaign: clip(parsed.utmCampaign, 200),
      utmContent: clip(parsed.utmContent, 200),
      utmTerm: clip(parsed.utmTerm, 200),
      referrer: clip(parsed.referrer, 500),
      landingPage: clip(parsed.landingPage, 500),
    };
  } catch {
    return {};
  }
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
    const attribution = await readAttribution();

    // Find default role (guest)
    const defaultRole = await prisma.role.findFirst({ where: { isDefault: true } });

    const user = await prisma.user.create({
      data: {
        name: name?.trim() || null,
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
        ...attribution,
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
