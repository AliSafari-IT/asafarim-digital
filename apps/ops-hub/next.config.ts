import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@asafarim/auth", "@asafarim/db"],
  // Ensure Prisma native engines are included in the standalone trace.
  // Paths are relative to this app directory.
  outputFileTracingIncludes: {
    "**/*": [
      "../../node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client/*.node",
      "../../node_modules/.pnpm/@prisma+client*/node_modules/@prisma/client/**",
      "../../node_modules/.prisma/client/*.node",
    ],
  },
};

export default nextConfig;
