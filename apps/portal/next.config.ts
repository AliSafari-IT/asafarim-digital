import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@asafarim/auth", "@asafarim/db"],
};

export default nextConfig;
