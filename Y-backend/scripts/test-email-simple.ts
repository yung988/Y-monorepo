import { resend } from "../lib/email/client";

async function testSimpleEmail() {
  try {
    console.log("Sending simple test email...");

    const data = await resend.emails.send({
      from: "admin@yeezuz2020.store",
      to: "jan.novak@example.com",
      subject: "Test Email",
      text: "Hello world!",
      html: "<h1>Hello world!</h1>",
    });

    console.log("✅ Email sent successfully!");
    console.log("Response:", data);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
}

testSimpleEmail();
