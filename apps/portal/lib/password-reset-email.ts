import nodemailer from "nodemailer";

type PasswordResetEmailInput = {
  to: string;
  name?: string | null;
  resetUrl: string;
};

function parseBoolean(value: string | undefined, defaultValue = false): boolean {
  if (value == null || value.trim() === "") return defaultValue;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "465");
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;

  if (!host || !user || !password || !from) {
    throw new Error("SMTP configuration is incomplete. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM.");
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

export async function sendPasswordResetEmail(input: PasswordResetEmailInput): Promise<void> {
  const config = getSmtpConfig();

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password,
    },
    requireTLS: config.requireTls,
    debug: config.debug,
    logger: config.logging,
  });

  const greetingName = input.name?.trim() || "there";
  const subject = "Reset your ASafariM Digital password";
  const text = [
    `Hi ${greetingName},`,
    "",
    "We received a request to reset your password.",
    "Use the link below to set a new password:",
    input.resetUrl,
    "",
    "If you did not request this, you can safely ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family:Segoe UI,Arial,sans-serif;line-height:1.6;color:#132033">
      <p>Hi ${greetingName},</p>
      <p>We received a request to reset your password.</p>
      <p>
        <a href="${input.resetUrl}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#2253d8;color:#fff;text-decoration:none;font-weight:600;">
          Reset password
        </a>
      </p>
      <p style="word-break:break-all">If the button does not work, use this link:<br /><a href="${input.resetUrl}">${input.resetUrl}</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: config.from,
    to: input.to,
    bcc: config.bcc || undefined,
    subject,
    text,
    html,
  });
}
