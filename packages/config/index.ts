// Shared configuration across the asafarim-digital ecosystem

export const config = {
  name: "ASafariM Digital",
  domain: "asafarim.com",
  portalUrl: process.env.PORTAL_URL || "https://portal.asafarim.com",
  contentGeneratorUrl: process.env.CONTENT_GENERATOR_URL || "https://content-generator.asafarim.com",
  marketingContentUrl: process.env.MARKETING_CONTENT_URL || "https://marketing-content.asafarim.com",
  opsHubUrl: process.env.OPS_HUB_URL || "https://ops-hub.asafarim.com",
  edumatchUrl: process.env.EDUMATCH_URL || "https://edumatch.asafarim.com",
  viontoUrl: process.env.VIONTO_URL || "https://vionto.asafarim.com",
  environment: (process.env.NODE_ENV || "production") as string,
  version: "0.1.0",
} as const;
