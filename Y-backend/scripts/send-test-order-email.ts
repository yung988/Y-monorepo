import { sendOrderConfirmationEmail } from "../lib/email/sendEmail";

async function main() {
  try {
    console.log("Sending test order confirmation email...");

    const result = await sendOrderConfirmationEmail({
      orderNumber: "TEST-001",
      customerName: "Jan Novák",
      orderDate: new Date().toLocaleDateString("cs-CZ"),
      items: [
        {
          name: "Nike Air Max 90",
          variant: "42",
          quantity: 1,
          price: 299900, // v haléřích
          image: "https://placehold.co/80x80/cccccc/000000?text=Nike",
        },
        {
          name: "Adidas Ultraboost 21",
          variant: "43",
          quantity: 2,
          price: 399900, // v haléřích
          image: "https://placehold.co/80x80/cccccc/000000?text=Adidas",
        },
      ],
      subtotal: 1099700, // v haléřích
      shipping: 9900, // v haléřích
      total: 1109600, // v haléřích
      shippingAddress: {
        line1: "Václavské náměstí 1",
        line2: "Budova A, 3. patro",
        city: "Praha 1",
        postalCode: "110 00",
        country: "Česká republika",
      },
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
