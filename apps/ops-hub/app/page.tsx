import { auth } from "@asafarim/auth";
import { redirect } from "next/navigation";
import { PublicHomepage } from "./PublicHomepage";
import { hasOpsAccess } from "@/lib/rbac";

export default async function RootPage({
  searchParams,
}: {
  searchParams: Promise<{ access?: string }>;
}) {
  const session = await auth();
  const sp = await searchParams;
  const accessState = sp.access === "requested" ? "requested" : sp.access === "required" ? "required" : undefined;

  // Unauthenticated users and signed-in users without Ops Hub roles see the public/access page.
  if (!session?.user || !hasOpsAccess(session.user.roles, "read")) {
    return (
      <PublicHomepage
        accessState={accessState ?? (session?.user ? "required" : undefined)}
        isSignedIn={Boolean(session?.user)}
      />
    );
  }

  // Authenticated users redirect to the overview console
  redirect("/overview");
}
