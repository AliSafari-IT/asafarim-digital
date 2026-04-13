import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath,
  transpilePackages: ["@asafarim/auth", "@asafarim/db"],
};

export default nextConfig;
