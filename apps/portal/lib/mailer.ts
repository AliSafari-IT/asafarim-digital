import nodemailer, { type Transporter } from "nodemailer";

function parseBoolean(value: string | undefined, defaultValue = false): boolean {
  if (value == null || value.trim() === "") return defaultValue;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

export function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "465");
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;

  if (!host || !user || !password || !from) {
    throw new Error(
      "SMTP configuration is incomplete. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM.",
    );
  }

  return {
    host,
    port,
    user,
    password,
    from,
    secure: parseBoolean(process.env.SMTP_SECURE, true),
    requireTls: parseBoolean(process.env.SMTP_REQUIRE_TLS, false),
    debug: parseBoolean(process.env.SMTP_DEBUG, false),
    logging: parseBoolean(process.env.SMTP_LOGGING, false),
    bcc: process.env.SMTP_TO,
  };
}

export function createTransport(): { transporter: Transporter; from: string; bcc?: string } {
  const config = getSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.password },
    requireTLS: config.requireTls,
    debug: config.debug,
    logger: config.logging,
  });
  return { transporter, from: config.from, bcc: config.bcc };
}

export function getPortalBaseUrl(): string {
  return (
    process.env.PORTAL_URL ||
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"
  );
}
