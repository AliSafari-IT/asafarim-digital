import { auth } from "@asafarim/auth";
import { redirect } from "next/navigation";
import { PublicHomepage } from "./PublicHomepage";

export default async function RootPage() {
  const session = await auth();

  // Unauthenticated users see the public homepage
  if (!session?.user) {
    return <PublicHomepage />;
  }

  // Authenticated users redirect to the overview console
  redirect("/overview");
}
