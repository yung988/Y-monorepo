import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/sendEmail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, text, html } = body;

    // Validate required fields
    if (!to || !subject) {
      return NextResponse.json({ error: "Missing required fields: to, subject" }, { status: 400 });
    }

    // Send email
    const result = await sendEmail({
      to,
      subject,
      text,
      html,
    });

    if (result.success) {
      return NextResponse.json(
        { message: "Email sent successfully", data: result.data },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        { error: "Failed to send email", details: result.error },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in email API route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
