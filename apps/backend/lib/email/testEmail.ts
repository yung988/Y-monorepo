import { sendEmail } from "./sendEmail";

/**
 * Send a test email
 * @param to Recipient email address
 * @returns Promise with email sending result
 */
export async function sendTestEmail(to: string) {
  const result = await sendEmail({
    to,
    subject: "Test Email from Yeezuz Store",
    text: "This is a test email sent from the Yeezuz store application.",
    html: "<h1>Test Email</h1><p>This is a test email sent from the Yeezuz store application.</p>",
  });

  return result;
}
