import { auth } from "@asafarim/auth";
import { PublicHomepage } from "./PublicHomepage";
import { Workspace } from "./Workspace";

export default async function ContentGeneratorPage() {
  const session = await auth();

  // If authenticated, show the workspace; otherwise, show the public homepage
  if (session?.user) {
    return <Workspace />;
  }

  return <PublicHomepage />;
}
