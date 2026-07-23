import { NextResponse } from "next/server";
import connectDB from "@/lib/db"; // ← was "@/lib/dbConnect" — FIXED
import Newsletter from "@/models/Newsletter";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    await connectDB();

    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "You're already subscribed!" },
        { status: 409 },
      );
    }

    await Newsletter.create({ email: email.toLowerCase() });

    return NextResponse.json(
      { success: true, message: "Subscribed successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
