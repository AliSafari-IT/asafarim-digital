import { NextResponse } from "next/server";
import { auth } from "@asafarim/auth";
import { Prisma, prisma } from "@asafarim/db";

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
      jobTitle: true,
      company: true,
      website: true,
      location: true,
      bio: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      userRoles: { select: { role: { select: { name: true, displayName: true } } } },
      eduStudentProfile: {
        select: {
          gradeLevel: true,
          subjectsOfInterest: true,
          updatedAt: true,
        },
      },
      eduTutorProfile: {
        select: {
          bio: true,
          subjectsTaught: true,
          levelsTaught: true,
          hourlyRateCents: true,
          onlineOnly: true,
          serviceRadiusKm: true,
          payoutEnabled: true,
          verifiedAt: true,
          ratingAvg: true,
          ratingCount: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const [
    eduInquiryCount,
    eduQuoteCount,
    eduStudentBookingCount,
    eduTutorBookingCount,
    viontoProjectCount,
    viontoAssetCount,
    viontoExportCount,
    viontoSharedWithMeCount,
    latestViontoProjects,
    latestViontoUsage,
  ] = await Promise.all([
    prisma.eduInquiry.count({ where: { studentId: user.id } }),
    prisma.eduQuote.count({ where: { tutorId: user.id } }),
    prisma.eduBooking.count({ where: { studentId: user.id } }),
    prisma.eduBooking.count({ where: { tutorId: user.id } }),
    prisma.viontoProject.count({ where: { userId: user.id } }),
    prisma.viontoAsset.count({ where: { userId: user.id } }),
    prisma.viontoExport.count({ where: { userId: user.id } }),
    prisma.viontoProjectShare.count({ where: { sharedWithUserId: user.id } }),
    prisma.viontoProject.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        mode: true,
        storyMode: true,
        emotionalTone: true,
        visualStyle: true,
        status: true,
        updatedAt: true,
      },
    }),
    prisma.viontoUsageMetric.findMany({
      where: { userId: user.id },
      orderBy: { periodStart: "desc" },
      take: 5,
      select: {
        metric: true,
        value: true,
        periodStart: true,
      },
    }),
  ]);

  // Map to flat roles array for the client
  const { userRoles, eduStudentProfile, eduTutorProfile, ...rest } = user;
  const roles = userRoles.map((ur: { role: { name: string; displayName: string } }) => ur.role.displayName);

  return NextResponse.json({
    user: { ...rest, roles },
    appProfiles: {
      edumatch: {
        student: eduStudentProfile,
        tutor: eduTutorProfile,
        stats: {
          inquiries: eduInquiryCount,
          quotes: eduQuoteCount,
          studentBookings: eduStudentBookingCount,
          tutorBookings: eduTutorBookingCount,
        },
      },
      vionto: {
        stats: {
          projects: viontoProjectCount,
          assets: viontoAssetCount,
          exports: viontoExportCount,
          sharedWithMe: viontoSharedWithMeCount,
        },
        recentProjects: latestViontoProjects,
        usage: latestViontoUsage,
      },
    },
  });
}

type GeocodeResult = {
  formattedAddress: string;
  location: { lat: number; lng: number };
};

async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!googleApiKey) return null;

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("key", googleApiKey);

  const data = await fetch(url.toString())
    .then((res) => res.json())
    .catch(() => null) as {
      status: string;
      results?: Array<{
        formatted_address: string;
        geometry: { location: { lat: number; lng: number } };
      }>;
    } | null;

  const first = data?.status === "OK" ? data.results?.[0] : null;
  if (!first) return null;

  return {
    formattedAddress: first.formatted_address,
    location: first.geometry.location,
  };
}

async function syncPrimaryHomeLocation(
  userId: string,
  location: string | null | undefined,
) {
  if (location === undefined) return;

  const formatted = location?.trim() || null;
  const geocoded = formatted ? await geocodeAddress(formatted) : null;
  const addressJson = formatted
    ? ({
        formatted: geocoded?.formattedAddress ?? formatted,
        source: "portal-profile",
      } as Prisma.InputJsonObject)
    : Prisma.JsonNull;

  const lat = geocoded?.location.lat ?? null;
  const lng = geocoded?.location.lng ?? null;
  const storedFormatted = geocoded?.formattedAddress ?? formatted;

  const existing = await prisma.userLocation.findFirst({
    where: { userId, type: "home", isPrimary: true },
    select: { id: true },
  });

  if (existing) {
    await prisma.userLocation.update({
      where: { id: existing.id },
      data: {
        formatted: storedFormatted,
        lat,
        lng,
        isVerified: Boolean(geocoded),
        source: geocoded ? "geocoded" : "manual",
        appScope: ["portal", "edumatch"],
      },
    });
  } else if (storedFormatted) {
    await prisma.userLocation.updateMany({
      where: { userId, type: "home", isPrimary: true },
      data: { isPrimary: false },
    });
    await prisma.userLocation.create({
      data: {
        userId,
        type: "home",
        formatted: storedFormatted,
        lat,
        lng,
        isPrimary: true,
        isVerified: Boolean(geocoded),
        source: geocoded ? "geocoded" : "manual",
        appScope: ["portal", "edumatch"],
      },
    });
  }

  await Promise.all([
    prisma.eduStudentProfile.updateMany({
      where: { userId },
      data: {
        homeAddress: addressJson,
        homeLat: lat,
        homeLng: lng,
      },
    }),
    prisma.eduTutorProfile.updateMany({
      where: { userId },
      data: {
        homeAddress: addressJson,
        homeLat: lat,
        homeLng: lng,
      },
    }),
  ]);
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
    location: normalizeOptionalText(payload.location, 160),
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
      jobTitle: true,
      company: true,
      website: true,
      location: true,
      bio: true,
      isActive: true,
      updatedAt: true,
      userRoles: { select: { role: { select: { name: true, displayName: true } } } },
    },
  });

  await syncPrimaryHomeLocation(currentUser.id, data.location);

  const { userRoles: updatedRoles, ...updatedRest } = updatedUser;
  const roles = updatedRoles.map((ur: { role: { name: string; displayName: string } }) => ur.role.displayName);

  return NextResponse.json({ user: { ...updatedRest, roles } });
}
