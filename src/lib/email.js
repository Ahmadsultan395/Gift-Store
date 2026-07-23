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
