"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslation } from "@asafarim/shared-i18n";
import { ProjectList, type ProjectRow } from "@/components/ProjectList";

export function ProjectsPageClient() {
  const router = useRouter();
  const { status } = useSession();
  const { t } = useTranslation();

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
        <p className="mb-4 text-[var(--color-text-muted)]">{t("vionto.projects.signInPrompt")}</p>
        <a
          href="/api/auth/signin"
          className="inline-block rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          {t("vionto.projects.signIn")}
        </a>
      </div>
    );
  }

  function handleSelect(project: ProjectRow) {
    router.push(`/create?projectId=${project.id}`);
  }

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">{t("vionto.projects.title")}</h1>
        <p className="mt-1 max-w-3xl text-sm text-[var(--color-text-muted)]">
          {t("vionto.projects.description")}
        </p>
      </div>
      <ProjectList onSelect={handleSelect} />
    </>
  );
}
