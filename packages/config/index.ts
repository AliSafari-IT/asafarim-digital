// Shared configuration across the asafarim-digital ecosystem

export const config = {
  name: "ASafariM Digital",
  domain: "asafarim.com",
  portalUrl: process.env.PORTAL_URL || "https://portal-qa.asafarim.com",
  environment: (process.env.NODE_ENV || "development") as string,
  version: "0.1.0",
} as const;
