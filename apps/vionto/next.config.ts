import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@asafarim/auth", "@asafarim/db", "@asafarim/ui", "@asafarim/types", "@asafarim/navigation", "@asafarim/shared-i18n", "@asafarim/country-language-selector"],
  serverExternalPackages: ["@aws-sdk/client-s3", "@aws-sdk/s3-request-presigner", "@smithy/types", "@smithy/shared-ini-file-loader", "@smithy/node-config-provider", "@smithy/middleware-endpoint"],
};

export default nextConfig;
