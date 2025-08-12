import { sendOrderStatusUpdateEmail } from "../lib/email/sendEmail";

async function main() {
  try {
    console.log("Sending test order status update email...");

    const result = await sendOrderStatusUpdateEmail({
      orderNumber: "TEST-001",
      customerName: "Jan Novák",
      newStatus: "shipped",
      trackingNumber: "Z1234567890",
      trackingUrl: "https://www.packeta.cz/cz/package/Z1234567890",
      estimatedDelivery: "5. 8. 2025",
      message: "Vaše objednávka byla právě odeslána a bude doručena do 3 pracovních dnů.",
    });

    if (result.success) {
      console.log("✅ Email sent successfully!");
      console.log("Response:", result.data);
    } else {
      console.error("❌ Failed to send email:", result.error);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
