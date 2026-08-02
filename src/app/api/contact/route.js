import connectDB from "@/lib/db";
import Contact from "@/models/Contact";
import { Settings } from "@/models/index";
import { sendMail, emailTemplate } from "@/lib/email";
import { ok, fail, serverError } from "@/lib/apiResponse";

export async function POST(request) {
  try {
    await connectDB();
    const { name, email, phone, subject, message } = await request.json();

    if (!name?.trim())    return fail("Name is required");
    if (!message?.trim()) return fail("Message is required");
    if (!phone?.trim() && !email?.trim()) return fail("Phone or email is required");

    // Save to database
    const contact = await Contact.create({
      name:    name.trim(),
      email:   email?.trim()   || "",
      phone:   phone?.trim()   || "",
      subject: subject?.trim() || "",
      message: message.trim(),
    });

    // Email notification to admin (if SMTP configured)
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const settings  = await Settings.findOne().select("storeName");
        const storeName = settings?.storeName || "Pansar Store";

        const html = emailTemplate({
          storeName,
          title: "New Contact Message",
          body: `
            <table style="width:100%;font-size:14px;border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0;color:#64748b;width:80px;">Name</td>
                <td style="padding:8px 0;font-weight:600;color:#0f172a;">${name}</td>
              </tr>
              ${phone ? `<tr><td style="padding:8px 0;color:#64748b;">Phone</td><td style="padding:8px 0;color:#0f172a;">${phone}</td></tr>` : ""}
              ${email ? `<tr><td style="padding:8px 0;color:#64748b;">Email</td><td style="padding:8px 0;color:#0f172a;">${email}</td></tr>` : ""}
              ${subject ? `<tr><td style="padding:8px 0;color:#64748b;">Subject</td><td style="padding:8px 0;color:#0f172a;">${subject}</td></tr>` : ""}
            </table>
            <div style="margin-top:16px;padding:16px;background:#f8fafc;border-left:3px solid #0B3D2E;border-radius:0 8px 8px 0;">
              <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${message}</p>
            </div>
            <div style="margin-top:20px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/messages"
                style="display:inline-block;background:#0B3D2E;color:#ffffff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">
                View in Admin Panel →
              </a>
            </div>
          `,
        });

        await sendMail({
          to:      process.env.SMTP_FROM,
          subject: `New Contact Message: ${subject || "Website Contact Form"}`,
          html,
        });
      } catch (emailErr) {
        console.warn("Admin notification failed:", emailErr.message);
      }
    }

    return ok({ id: contact._id }, "Thank you! We will get back to you shortly.");
  } catch (e) { return serverError(e); }
}
