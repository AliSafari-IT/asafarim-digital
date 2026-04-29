import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath,
  transpilePackages: ["@asafarim/auth", "@asafarim/db", "@asafarim/shared-i18n", "@asafarim/ui"],
  outputFileTracingIncludes: {
    "**/*": [
      "../../node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client/*.node",
      "../../node_modules/.pnpm/@prisma+client*/node_modules/@prisma/client/**",
      "../../node_modules/.prisma/client/*.node",
    ],
  },
};

export default nextConfig;
