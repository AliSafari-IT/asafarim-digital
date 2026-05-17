"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ProjectList, type ProjectRow } from "@/components/ProjectList";

export function ProjectsPageClient() {
  const router = useRouter();
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-8 py-16 text-center">
        <p className="mb-4 text-[var(--color-text-muted)]">Sign in to view your projects.</p>
        <a
          href="/api/auth/signin"
          className="inline-block rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Sign in
        </a>
      </div>
    );
  }

  function handleSelect(project: ProjectRow) {
    router.push(`/create?projectId=${project.id}`);
  }

  return <ProjectList onSelect={handleSelect} />;
}
