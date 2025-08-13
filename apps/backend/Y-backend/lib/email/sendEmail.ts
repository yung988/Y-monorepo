import { resend } from "./client";
import OrderConfirmationEmail from "./OrderConfirmationEmail";
import OrderStatusUpdateEmail from "./OrderStatusUpdateEmail";

interface EmailAttachment {
  filename: string;
  content: Buffer | string; // Buffer preferred; string for base64 fallback
  contentType?: string;
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  react?: React.ReactNode;
  attachments?: EmailAttachment[];
}

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  orderDate: string;
  items: Array<{
    name: string;
    variant?: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
  isPacketa?: boolean;
  packetaPickupPoint?: string;
}

interface OrderStatusUpdateEmailProps {
  orderNumber: string;
  customerName: string;
  newStatus: "processing" | "shipped" | "delivered" | "cancelled";
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  message?: string;
}

/**
 * Send an email using Resend
 * @param options Email options including to, subject, and content
 * @returns Promise with email sending result
 */
export async function sendEmail(options: EmailOptions) {
  try {
    const { to, subject, text, html, react, attachments } = options;

    const from = process.env.FROM_EMAIL || "admin@yeezuz2020.store";

    const emailData: any = {
      from,
      to,
      subject,
      text,
      html,
      react,
    };

    if (attachments && attachments.length > 0) {
      // Map to Resend attachments shape
      emailData.attachments = attachments.map((a) => ({
        filename: a.filename,
        content: a.content instanceof Buffer ? a.content.toString("base64") : a.content,
        path: undefined,
        contentType: a.contentType || "application/pdf",
      }));
    }

    const response = await resend.emails.send(emailData);
    return { success: true, data: response };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

/**
 * Send order confirmation email
 * @param to Customer email address
 * @param props Order confirmation email properties
 * @returns Promise with email sending result
 */
export async function sendOrderConfirmationEmail(
  to: string,
  props: OrderConfirmationEmailProps,
  attachments?: EmailAttachment[],
) {
  try {
    const emailData: any = {
      from: process.env.FROM_EMAIL || "admin@yeezuz2020.store",
      to,
      subject: `Potvrzení objednávky #${props.orderNumber} - Yeezuz Store`,
      react: OrderConfirmationEmail(props),
    };

    if (attachments && attachments.length > 0) {
      emailData.attachments = attachments.map((a) => ({
        filename: a.filename,
        content: a.content instanceof Buffer ? a.content.toString("base64") : a.content,
        contentType: a.contentType || "application/pdf",
      }));
    }

    const response = await resend.emails.send(emailData);
    return { success: true, data: response };
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return { success: false, error };
  }
}

/**
 * Send order status update email
 * @param props Order status update email properties
 * @returns Promise with email sending result
 */
export async function sendOrderStatusUpdateEmail(
  props: OrderStatusUpdateEmailProps & { to: string },
) {
  try {
    const statusLabels: Record<string, string> = {
      processing: "Vaše objednávka se zpracovává",
      shipped: "Vaše objednávka byla odeslána",
      delivered: "Vaše objednávka byla doručena",
      cancelled: "Vaše objednávka byla zrušena",
    };

    const emailData = {
      from: process.env.FROM_EMAIL || "admin@yeezuz2020.store",
      to: props.to,
      subject: `${statusLabels[props.newStatus] || "Změna stavu objednávky"} - Objednávka #${props.orderNumber}`,
      react: OrderStatusUpdateEmail(props),
    };

    const response = await resend.emails.send(emailData);
    return { success: true, data: response };
  } catch (error) {
    console.error("Error sending order status update email:", error);
    return { success: false, error };
  }
}
