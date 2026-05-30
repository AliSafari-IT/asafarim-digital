import { redirect } from "next/navigation";
import { auth } from "@asafarim/auth";
import { prisma } from "@asafarim/db";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { ProfileForm } from "@/components/profile-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/profile");
  }

  const dbUser = await prisma.user
    .findUnique({
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
        createdAt: true,
        updatedAt: true,
        userRoles: { select: { role: { select: { displayName: true } } } },
        eduStudentProfile: {
          select: {
            gradeLevel: true,
            subjectsOfInterest: true,
            createdAt: true,
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
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    })
    .catch((error) => {
      console.error("Profile: failed to load user record", error);
      return null;
    });

  if (!dbUser) {
    redirect("/sign-in?callbackUrl=/profile");
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
    prisma.eduInquiry.count({ where: { studentId: dbUser.id } }),
    prisma.eduQuote.count({ where: { tutorId: dbUser.id } }),
    prisma.eduBooking.count({ where: { studentId: dbUser.id } }),
    prisma.eduBooking.count({ where: { tutorId: dbUser.id } }),
    prisma.viontoProject.count({ where: { userId: dbUser.id } }),
    prisma.viontoAsset.count({ where: { userId: dbUser.id } }),
    prisma.viontoExport.count({ where: { userId: dbUser.id } }),
    prisma.viontoProjectShare.count({ where: { sharedWithUserId: dbUser.id } }),
    prisma.viontoProject.findMany({
      where: { userId: dbUser.id },
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
      where: { userId: dbUser.id },
      orderBy: { periodStart: "desc" },
      take: 5,
      select: {
        metric: true,
        value: true,
        periodStart: true,
      },
    }),
  ]);

  const { userRoles, eduStudentProfile, eduTutorProfile, ...rest } = dbUser;
  const user = {
    ...rest,
    roles: userRoles.map((ur) => ur.role.displayName),
  };

  const appProfiles = {
    edumatch: {
      student: eduStudentProfile
        ? {
            gradeLevel: eduStudentProfile.gradeLevel,
            subjectsOfInterest: eduStudentProfile.subjectsOfInterest,
            updatedAt: eduStudentProfile.updatedAt.toISOString(),
          }
        : null,
      tutor: eduTutorProfile
        ? {
            bio: eduTutorProfile.bio,
            subjectsTaught: eduTutorProfile.subjectsTaught,
            levelsTaught: eduTutorProfile.levelsTaught,
            hourlyRateCents: eduTutorProfile.hourlyRateCents,
            onlineOnly: eduTutorProfile.onlineOnly,
            serviceRadiusKm: eduTutorProfile.serviceRadiusKm,
            payoutEnabled: eduTutorProfile.payoutEnabled,
            verifiedAt: eduTutorProfile.verifiedAt?.toISOString() ?? null,
            ratingAvg: eduTutorProfile.ratingAvg,
            ratingCount: eduTutorProfile.ratingCount,
            updatedAt: eduTutorProfile.updatedAt.toISOString(),
          }
        : null,
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
      recentProjects: latestViontoProjects.map((project) => ({
        ...project,
        updatedAt: project.updatedAt.toISOString(),
      })),
      usage: latestViontoUsage.map((metric) => ({
        ...metric,
        periodStart: metric.periodStart.toISOString(),
      })),
    },
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--color-surface)] text-[var(--color-text)]">
      <div aria-hidden="true" className="site-noise" />
      <SiteHeader
        navItems={[
          { href: "/#capabilities", label: "Capabilities" },
          { href: "/#showcase", label: "Work" },
          { href: "/profile", label: "Profile" },
          { href: "/#contact", label: "Contact" },
        ]}
      />

      <main className="mx-auto w-full max-w-7xl px-6 pb-20 pt-10 sm:pt-14">
        <ProfileForm user={user} appProfiles={appProfiles} />
      </main>

      <SiteFooter subtitle="Account profile, identity, and future workspace settings" />
    </div>
  );
}
