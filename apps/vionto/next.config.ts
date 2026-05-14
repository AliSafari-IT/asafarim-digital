import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@asafarim/auth", "@asafarim/db", "@asafarim/ui", "@asafarim/types", "@asafarim/shared-i18n", "@asafarim/country-language-selector"],
};

export default nextConfig;
