import { createTransport } from "./mailer";

type VerificationEmailInput = {
  to: string;
  name?: string | null;
  verifyUrl: string;
};

export async function sendVerificationEmail(input: VerificationEmailInput): Promise<void> {
  const { transporter, from, bcc } = createTransport();

  const greetingName = input.name?.trim() || "there";
  const subject = "Verify your ASafariM Digital email";
  const text = [
    `Hi ${greetingName},`,
    "",
    "Confirm your email address to unlock profile editing and other features.",
    "Click the link below to verify your account:",
    input.verifyUrl,
    "",
    "If you did not request this, you can safely ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family:Segoe UI,Arial,sans-serif;line-height:1.6;color:#132033">
      <p>Hi ${greetingName},</p>
      <p>Confirm your email address to unlock profile editing and other features.</p>
      <p>
        <a href="${input.verifyUrl}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#2253d8;color:#fff;text-decoration:none;font-weight:600;">
          Verify email
        </a>
      </p>
      <p style="word-break:break-all">If the button does not work, use this link:<br /><a href="${input.verifyUrl}">${input.verifyUrl}</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from,
    to: input.to,
    bcc: bcc || undefined,
    subject,
    text,
    html,
  });
}
