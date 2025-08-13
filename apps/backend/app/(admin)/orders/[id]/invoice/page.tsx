import { AdminHeader } from "@/components/admin-header";
import { createClient } from "@/lib/supabase/server";
import { requireAdminOrEditor } from "@/lib/supabase-auth";

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminOrEditor();
  const { id } = await params;
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      customer_name,
      customer_email,
      customer_phone,
      total_amount,
      currency,
      created_at,
      payment_status,
      shipping_method,
      packeta_pickup_point_name,
      order_items(
        quantity,
        price,
        size,
        product:products(name, sku)
      )
    `)
    .eq("id", id)
    .single();

  if (error || !order) {
    return (
      <div className="p-6">
        <AdminHeader title="Faktura" breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Objednávky", href: "/orders" }, { label: "Faktura" }]} />
        <p className="text-red-600">Objednávka nebyla nalezena.</p>
      </div>
    );
  }

  const number = order.order_number || order.id.slice(0, 8);
  const created = new Date(order.created_at);
  const items = (order as any).order_items || [];
  const currency = (order.currency || "CZK").toUpperCase();

  return (
    <div className="p-6 print:p-0">
      <div className="hidden print:block absolute top-0 left-0 right-0 h-2 bg-black" />
      <AdminHeader
        title={`Faktura / Potvrzení objednávky #${number}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Objednávky", href: "/orders" },
          { label: `#${number}` },
        ]}
      />
      <div className="max-w-3xl mx-auto bg-white text-black rounded-md shadow print:shadow-none print:rounded-none print:max-w-none print:bg-white">
        <div className="flex items-start justify-between p-6 border-b">
          <div>
            <h1 className="text-xl font-semibold">Potvrzení o přijetí platby</h1>
            <p className="text-sm text-muted-foreground">Nejsme plátci DPH</p>
          </div>
          <div className="text-right text-sm">
            <div><span className="font-medium">Objednávka:</span> #{number}</div>
            <div><span className="font-medium">Datum:</span> {created.toLocaleDateString("cs-CZ")}</div>
            <div><span className="font-medium">Stav platby:</span> {order.payment_status || "—"}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-b">
          <div>
            <h2 className="font-medium mb-2">Prodávající</h2>
            <div className="text-sm">
              <div>Váš e‑shop</div>
              <div>IČO: —</div>
              <div>DIČ: —</div>
              <div>Email: {process.env.EMAIL_FROM || "info@example.com"}</div>
            </div>
          </div>
          <div>
            <h2 className="font-medium mb-2">Zákazník</h2>
            <div className="text-sm">
              <div>{order.customer_name || "—"}</div>
              <div>{order.customer_email}</div>
              {order.customer_phone && <div>{order.customer_phone}</div>}
              {order.packeta_pickup_point_name && (
                <div className="mt-2 text-muted-foreground">Výdejní místo: {order.packeta_pickup_point_name}</div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Položka</th>
                <th className="py-2">SKU</th>
                <th className="py-2">Velikost</th>
                <th className="py-2">Množství</th>
                <th className="py-2 text-right">Cena</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it: any, idx: number) => (
                <tr key={idx} className="border-b last:border-b-0">
                  <td className="py-2">{it.product?.name || "Položka"}</td>
                  <td className="py-2">{it.product?.sku || "—"}</td>
                  <td className="py-2">{it.size || "—"}</td>
                  <td className="py-2">{it.quantity}</td>
                  <td className="py-2 text-right">{(it.price / 100).toLocaleString("cs-CZ")} {currency}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-6">
            <div className="text-right">
              <div className="text-lg font-semibold">
                Celkem: {(order.total_amount / 100).toLocaleString("cs-CZ")} {currency}
              </div>
              <div className="text-xs text-muted-foreground">Včetně všech poplatků. Nejsme plátci DPH.</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t">
          <div className="text-xs text-muted-foreground">
            Tento dokument slouží jako potvrzení o zaplacení. Uchovejte si jej pro svou evidenci.
          </div>
          <button className="px-3 py-1.5 text-sm border rounded-md print:hidden" onClick={() => (typeof window !== 'undefined' ? window.print() : undefined)}>
            Vytisknout / Uložit jako PDF
          </button>
        </div>
      </div>
    </div>
  );
}

