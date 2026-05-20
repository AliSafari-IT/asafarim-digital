import { createTransport } from "./mailer";

type PasswordResetEmailInput = {
  to: string;
  name?: string | null;
  resetUrl: string;
};

export async function sendPasswordResetEmail(input: PasswordResetEmailInput): Promise<void> {
  const { transporter, from } = createTransport();

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
    from,
    to: input.to,
    subject,
    text,
    html,
  });
}
