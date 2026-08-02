import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send a single email. Used by the admin "reply to message" flow.
 */
export async function sendMail({ to, subject, html }) {
  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  });
}

export async function sendBulkEmail(emails, subject, message) {
  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    bcc: emails,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        ${message.replace(/\n/g, "<br>")}
      </div>
    `,
  });
}

/**
 * Wrap a body of HTML in a branded email shell (header with store name,
 * content area, footer note). `body` should already be safe HTML —
 * callers are responsible for escaping any user-supplied text they
 * interpolate into it.
 */
export function emailTemplate({
  storeName = "Our Store",
  title = "",
  body = "",
  footerNote = "",
}) {
  return `
  <!DOCTYPE html>
  <html>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
              <tr>
                <td style="background:#0B3D2E;padding:24px 28px;">
                  <p style="margin:0;font-size:16px;font-weight:800;color:#ffffff;letter-spacing:-0.01em;">${storeName}</p>
                  ${title ? `<p style="margin:6px 0 0;font-size:13px;color:#C8F08A;font-weight:600;">${title}</p>` : ""}
                </td>
              </tr>
              <tr>
                <td style="padding:28px;">
                  ${body}
                </td>
              </tr>
              ${
                footerNote
                  ? `<tr>
                      <td style="padding:16px 28px;border-top:1px solid #f1f5f9;">
                        <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.5;">${footerNote}</p>
                      </td>
                    </tr>`
                  : ""
              }
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}
