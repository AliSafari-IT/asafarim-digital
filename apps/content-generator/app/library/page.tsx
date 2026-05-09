import { auth } from "@asafarim/auth";
import { redirect } from "next/navigation";
import { DraftLibrary } from "./DraftLibrary";

export const dynamic = "force-dynamic";
export const metadata = { title: "Draft Library" };

export default async function LibraryPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in?callbackUrl=/library");
  return <DraftLibrary />;
}
