import connectDB from "@/lib/db";
import Contact from "@/models/Contact";
import { Settings } from "@/models/index";
import { sendMail, emailTemplate } from "@/lib/email";
import { ok, notFound, fail, serverError } from "@/lib/apiResponse";

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();

    const msg = await Contact.findById(params.id);
    if (!msg) return notFound("Message not found");

    // Mark as read
    if (body.action === "markRead") {
      msg.isRead = true;
      await msg.save();
      return ok({ isRead: true }, "Marked as read");
    }

    // Send reply
    if (body.action === "reply") {
      const { replyText } = body;
      if (!replyText?.trim()) return fail("Reply text is required");

      // No email — save internally, contact via phone
      if (!msg.email) {
        msg.reply     = replyText;
        msg.isReplied = true;
        msg.repliedAt = new Date();
        msg.isRead    = true;
        await msg.save();
        return ok(msg, `Reply saved. Contact customer via phone: ${msg.phone}`);
      }

      // Check SMTP config
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return fail("Email not configured. Add SMTP settings to .env file.");
      }

      const settings  = await Settings.findOne().select("storeName");
      const storeName = settings?.storeName || "Pansar Store";

      const html = emailTemplate({
        storeName,
        title: `Reply to your message`,
        body: `
          <p style="font-size:14px;color:#374151;margin:0 0 16px;">Hello <strong>${msg.name}</strong>,</p>
          <p style="font-size:14px;color:#374151;margin:0 0 16px;">Thank you for contacting us. Here is our response:</p>
          <div style="background:#f0fdf4;border-left:3px solid #0B3D2E;padding:16px;border-radius:0 8px 8px 0;margin-bottom:20px;">
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;white-space:pre-line;">${replyText}</p>
          </div>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;">
            <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Your original message</p>
            <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">${msg.message}</p>
          </div>
        `,
        footerNote: `This is a reply to your contact form submission on ${storeName}.`,
      });

      await sendMail({
        to:      msg.email,
        subject: `Re: ${msg.subject || "Your Message"} — ${storeName}`,
        html,
      });

      msg.reply     = replyText;
      msg.isReplied = true;
      msg.repliedAt = new Date();
      msg.isRead    = true;
      await msg.save();

      return ok(msg, `Reply sent to ${msg.email}`);
    }

    return fail("Invalid action");
  } catch (e) { return serverError(e); }
}

export async function DELETE(_, { params }) {
  try {
    await connectDB();
    await Contact.findByIdAndDelete(params.id);
    return ok(null, "Message deleted");
  } catch (e) { return serverError(e); }
}
