import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAdminOrEditor } from "@/lib/api-auth";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Authenticate admin/editor request
  const authResult = await requireAdminOrEditor(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const supabase = await createClient();
    const { id: orderId } = await params;

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ success: false, error: "Objednávka nenalezena" }, { status: 404 });
    }

    // Check if shipment exists
    if (!order.packeta_label_id || !order.packeta_tracking_number) {
      return NextResponse.json({ success: false, error: "Zásilka nebyla vytvořena nebo nemá sledovací číslo" }, { status: 400 });
    }

    // Prepare email data
    const trackingUrl = `https://www.zasilkovna.cz/sledovani?id=${order.packeta_tracking_number}`;
    const emailData = {
      to: order.customer_email,
      subject: `Vaše objednávka #${order.order_number || String(order.id).slice(0, 8)} byla odeslána`,
      html: `
        <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">
          <h2>Vaše objednávka byla odeslána</h2>

          <p>Dobrý den ${order.customer_name || ""},</p>

          <p>Vaše objednávka <strong>#${order.order_number || String(order.id).slice(0, 8)}</strong> byla odeslána prostřednictvím Zásilkovny.</p>

          <div style=\"background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;\">
            <h3>Informace o zásilce:</h3>
            <p><strong>Sledovací číslo:</strong> ${order.packeta_tracking_number}</p>
            <p><strong>Výdejní místo:</strong> ${order.packeta_pickup_point_name || "Zásilkovna"}</p>

            <div style=\"margin-top: 20px;\">
              <a href=\"${trackingUrl}\"
                 style=\"background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;\">
                Sledovat zásilku
              </a>
            </div>
          </div>

          <p>Zásilku si můžete vyzvednout na vybraném výdejním místě po obdržení SMS nebo emailové notifikace o doručení.</p>

          <p>Děkujeme za vaši objednávku!</p>

          <hr style=\"margin: 30px 0; border: none; border-top: 1px solid #eee;\">
          <p style=\"font-size: 12px; color: #666;\">
            Tento email byl odeslán automaticky. Prosím neodpovídejte na něj.
          </p>
        </div>
      `,
    };

    // Send email using Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "noreply@yeezuz2020.store",
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
      }),
    });

    if (!emailResponse.ok) {
      const emailError = await emailResponse.json();
      console.error("Failed to send tracking email:", emailError);
      return NextResponse.json({ success: false, error: "Chyba při odesílání emailu" }, { status: 500 });
    }

    const emailResult = await emailResponse.json();
    console.log("Tracking email sent successfully:", emailResult);

    return NextResponse.json({
      success: true,
      message: "Sledovací číslo bylo odesláno zákazníkovi",
      emailId: emailResult.id,
    });
  } catch (error: unknown) {
    console.error("Error sending tracking email:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        error: "Chyba při odesílání sledovacího čísla",
        details: message,
      },
      { status: 500 },
    );
  }
}
