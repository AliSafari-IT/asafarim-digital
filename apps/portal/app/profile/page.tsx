import { redirect } from "next/navigation";
import { auth } from "@asafarim/auth";
import { prisma } from "@asafarim/db";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/profile");
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
    redirect("/sign-in");
  }

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
        <ProfileForm user={user} />
      </main>

      <SiteFooter subtitle="Account profile, identity, and future workspace settings" />
    </div>
  );
}
