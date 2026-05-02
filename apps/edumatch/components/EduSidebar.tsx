"use client";

import { useSession } from "next-auth/react";
import { CommonSidebar, SidebarLayout } from "@asafarim/ui";
import type { AppCode } from "@asafarim/types";
import { useNavigation } from "@asafarim/ui";
import Link from "next/link";

interface EduSidebarProps {
  children: React.ReactNode;
  userRole?: "student" | "tutor";
}

// Header component for sidebar
function SidebarHeader({ userRole }: { userRole?: "student" | "tutor" }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-xs font-bold text-white">
        E
      </div>
      {!userRole && (
        <span className="text-sm font-semibold text-[var(--color-text)]">EduMatch</span>
      )}
      {userRole && (
        <span className="text-sm font-semibold text-[var(--color-text)]">
          {userRole === "student" ? "Student" : "Tutor"}
        </span>
      )}
    </Link>
  );
}

// Footer component for sidebar
function SidebarFooter() {
  return (
    <div className="text-xs text-[var(--color-text-muted)]">
      <p>© 2026 EduMatch</p>
    </div>
  );
}

// Student sidebar component
export function StudentSidebar({ children }: { children: React.ReactNode }) {
  const { items, loading, error } = useNavigation("edumatch" as AppCode, "sidebar");
  const { data: session } = useSession();

  // Filter items for students only
  const studentItems = items.filter((item) => {
    // Include items that require edumatch_student role or have no specific role requirement
    if (item.requiredRole) {
      return item.requiredRole === "edumatch_student";
    }
    // Include authenticated items if user is logged in
    if (item.visibility === "authenticated") {
      return !!session?.user;
    }
    return true;
  });

  if (error) {
    console.error("Sidebar navigation fetch error:", error);
  }

  const sidebar = (
    <CommonSidebar
      items={studentItems}
      app="edumatch" as AppCode
      header={<SidebarHeader userRole="student" />}
      footer={<SidebarFooter />}
      width="w-64"
      collapsible={true}
    />
  );

  return <SidebarLayout sidebar={sidebar}>{children}</SidebarLayout>;
}

// Tutor sidebar component
export function TutorSidebar({ children }: { children: React.ReactNode }) {
  const { items, loading, error } = useNavigation("edumatch" as AppCode, "sidebar");
  const { data: session } = useSession();

  // Filter items for tutors only
  const tutorItems = items.filter((item) => {
    // Include items that require edumatch_tutor role or have no specific role requirement
    if (item.requiredRole) {
      return item.requiredRole === "edumatch_tutor";
    }
    // Include authenticated items if user is logged in
    if (item.visibility === "authenticated") {
      return !!session?.user;
    }
    return true;
  });

  if (error) {
    console.error("Sidebar navigation fetch error:", error);
  }

  const sidebar = (
    <CommonSidebar
      items={tutorItems}
      app="edumatch" as AppCode
      header={<SidebarHeader userRole="tutor" />}
      footer={<SidebarFooter />}
      width="w-64"
      collapsible={true}
    />
  );

  return <SidebarLayout sidebar={sidebar}>{children}</SidebarLayout>;
}

// Generic EduSidebar that auto-detects user role
export function EduSidebar({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const userRoles = session?.user?.roles as string[] || [];

  const isStudent = userRoles.includes("edumatch_student");
  const isTutor = userRoles.includes("edumatch_tutor");

  if (isStudent) {
    return <StudentSidebar>{children}</StudentSidebar>;
  }

  if (isTutor) {
    return <TutorSidebar>{children}</TutorSidebar>;
  }

  // Fallback - no sidebar for unauthenticated or users without specific role
  return <>{children}</>;
}
