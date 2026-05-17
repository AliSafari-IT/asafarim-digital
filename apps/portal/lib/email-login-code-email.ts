import { createTransport, getPortalBaseUrl } from "./mailer";

type EmailLoginCodeInput = {
  to: string;
  name?: string | null;
  code: string;
  expiresInMinutes: number;
};

export async function sendEmailLoginCode(input: EmailLoginCodeInput): Promise<void> {
  const { transporter, from, bcc } = createTransport();

  const greetingName = input.name?.trim() || "there";
  const baseUrl = getPortalBaseUrl();
  const subject = `${input.code} — Your ASafariM Digital login code`;

  const text = [
    `Hi ${greetingName},`,
    "",
    "Use the code below to sign in to ASafariM Digital:",
    "",
    `    ${input.code}`,
    "",
    `This code expires in ${input.expiresInMinutes} minute${input.expiresInMinutes === 1 ? "" : "s"}.`,
    "",
    "If you did not request this code, you can safely ignore this email.",
    "Your account has not been accessed.",
    "",
    `— ASafariM Digital · ${baseUrl}`,
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your login code</title>
</head>
<body style="margin:0;padding:0;background:#0b1220;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b1220;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:28px;text-align:center;">
              <div style="display:inline-flex;align-items:center;justify-content:center;
                          width:48px;height:48px;border-radius:14px;
                          background:linear-gradient(135deg,#4c7dff,#7c5cfc);
                          font-size:14px;font-weight:700;color:#fff;letter-spacing:0.5px;">
                AD
              </div>
              <p style="margin:8px 0 0;font-size:11px;font-weight:600;
                        text-transform:uppercase;letter-spacing:0.22em;color:#4c7dff;">
                ASafariM Digital
              </p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#111c2e;border-radius:16px;
                       border:1px solid rgba(76,125,255,0.18);
                       padding:36px 32px 32px;">

              <p style="margin:0 0 6px;font-size:11px;font-weight:600;
                        text-transform:uppercase;letter-spacing:0.22em;color:#4c7dff;">
                Sign-in code
              </p>
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;
                         color:#ffffff;line-height:1.3;">
                Hi ${greetingName}, here&rsquo;s your code
              </h1>
              <p style="margin:0 0 28px;font-size:14px;color:#8a9ec0;line-height:1.6;">
                Enter this code on the sign-in page to access your account.
                It is valid for <strong style="color:#ffffff;">${input.expiresInMinutes}&nbsp;minute${input.expiresInMinutes === 1 ? "" : "s"}</strong>.
              </p>

              <!-- OTP display -->
              <div style="background:#0d1526;border:1px solid rgba(76,125,255,0.25);
                          border-radius:12px;padding:20px 0;text-align:center;
                          margin-bottom:28px;">
                <span style="font-size:36px;font-weight:700;letter-spacing:0.35em;
                             color:#ffffff;font-family:'Courier New',Courier,monospace;">
                  ${input.code}
                </span>
              </div>

              <p style="margin:0;font-size:12px;color:#5a6e8a;line-height:1.6;">
                If you did not request this code, you can safely ignore this email —
                your account has not been accessed and no changes have been made.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#3a4e6a;">
                © ${new Date().getFullYear()} ASafariM Digital ·
                <a href="${baseUrl}" style="color:#4c7dff;text-decoration:none;">${baseUrl.replace(/^https?:\/\//, "")}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  await transporter.sendMail({
    from,
    to: input.to,
    bcc: bcc || undefined,
    subject,
    text,
    html,
  });
}
