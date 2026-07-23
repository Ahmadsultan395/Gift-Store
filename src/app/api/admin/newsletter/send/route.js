import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Newsletter from "@/models/Newsletter";
import { sendBulkEmail } from "@/lib/email";

export async function POST(req) {
  try {
    await connectDB();

    const { sendToAll, subscriberIds, subject, message } = await req.json();

    // Validation
    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Subject and message are required",
        },
        {
          status: 400,
        },
      );
    }

    let subscribers = [];

    // Send to all active subscribers
    if (sendToAll) {
      subscribers = await Newsletter.find(
        {
          isActive: true,
        },
        "email",
      );
    }
    // Send to selected subscribers
    else {
      if (!subscriberIds || subscriberIds.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "No subscribers selected",
          },
          {
            status: 400,
          },
        );
      }

      subscribers = await Newsletter.find(
        {
          _id: {
            $in: subscriberIds,
          },
          isActive: true,
        },
        "email",
      );
    }

    const emails = subscribers.map((subscriber) => subscriber.email);

    if (emails.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No active subscribers found",
        },
        {
          status: 404,
        },
      );
    }

    // Send email
    await sendBulkEmail(emails, subject.trim(), message.trim());

    console.log({
      totalRecipients: emails.length,
      subject,
    });

    return NextResponse.json(
      {
        success: true,
        sent: emails.length,
        message: `Email sent to ${emails.length} subscriber(s).`,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Newsletter Send Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send email",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      {
        status: 500,
      },
    );
  }
}
