import { ViontoNav } from "@/components/ViontoNav";
import { ProjectsPageClient } from "./ProjectsPageClient";

export const metadata = {
  title: "My Projects – Vionto",
  description: "View, manage, and share your Vionto video projects.",
};

export default function ProjectsPage() {
  return (
    <>
      <ViontoNav />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Manage your video projects. Create new ones, rename or delete existing ones, or share them with teammates.
          </p>
        </div>
        <ProjectsPageClient />
      </main>
    </>
  );
}
