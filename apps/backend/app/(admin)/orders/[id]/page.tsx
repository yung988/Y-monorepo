import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin-header";

import { PacketaShipmentCard } from "@/components/packeta-shipment-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface OrderItem {
  id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  price: number;
  products?: {
    name: string;
    sku: string;
  };
  product_variants?: {
    size: string;
    sku: string;
  };
}

interface Order {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  shipping_method: string;
  shipping_address: { street: string; city: string; postal_code: string; country: string } | null;
  packeta_pickup_point_id?: string;
  packeta_pickup_point_name?: string;
  packeta_label_id?: string;
  packeta_tracking_number?: string;
  order_items: OrderItem[];
}

async function getOrder(id: string): Promise<Order | null> {
  try {
    const { createClient } = await import("@/utils/supabase/server");
    const supabase = await createClient();

    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (name, sku),
          product_variants (size, sku)
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching order:", error);
      return null;
    }

    return order;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Čeká na platbu", variant: "secondary" as const },
      confirmed: { label: "Potvrzeno", variant: "default" as const },
      paid: { label: "Zaplaceno kartou", variant: "default" as const },
      shipped: { label: "Odesláno", variant: "outline" as const },
      delivered: { label: "Doručeno", variant: "default" as const },
      cancelled: { label: "Zrušeno", variant: "destructive" as const },
    };
    return (
      statusMap[status as keyof typeof statusMap] || {
        label: status,
        variant: "secondary" as const,
      }
    );
  };

  return (
    <>
      <AdminHeader
        title={`Objednávka ${order.id}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Objednávky", href: "/orders" },
          { label: order.id },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-4">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Informace o zákazníkovi */}
          <Card>
            <CardHeader>
              <CardTitle>Zákazník</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">{order.customer_name}</p>
                <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                <p className="text-sm text-muted-foreground">{order.customer_phone || "-"}</p>
              </div>
              <Separator />
              <div>
                <p className="font-medium mb-2">Způsob dopravy</p>
                <p className="text-sm text-muted-foreground">
                  {order.shipping_method === "packeta"
                    ? "Zásilkovna"
                    : order.shipping_method === "standard"
                      ? "Standardní doprava"
                      : order.shipping_method || "Neuvedeno"}
                </p>
                {order.packeta_pickup_point_name && (
                  <p className="text-sm text-muted-foreground">
                    Výdejní místo: {order.packeta_pickup_point_name}
                  </p>
                )}
              </div>
              {order.shipping_address && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium mb-2">Doručovací adresa</p>
                    <div className="text-sm text-muted-foreground">
                      <p>{order.shipping_address.street}</p>
                      <p>
                        {order.shipping_address.postal_code} {order.shipping_address.city}
                      </p>
                      <p>{order.shipping_address.country}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Status objednávky */}
          <Card>
            <CardHeader>
              <CardTitle>Status objednávky</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span>Aktuální status:</span>
                <Badge variant={getStatusBadge(order.status).variant}>
                  {getStatusBadge(order.status).label}
                </Badge>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="status-select">
                  Změnit status:
                </label>
                <Select defaultValue={order.status}>
                  <SelectTrigger id="status-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Čeká na platbu</SelectItem>
                    <SelectItem value="paid">Zaplaceno</SelectItem>
                    <SelectItem value="shipped">Odesláno</SelectItem>
                    <SelectItem value="delivered">Doručeno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">Aktualizovat status</Button>
            </CardContent>
          </Card>

          {/* Shrnutí objednávky */}
          <Card>
            <CardHeader>
              <CardTitle>Shrnutí</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Datum objednávky:</span>
                <span>{new Date(order.created_at).toLocaleDateString("cs-CZ")}</span>
              </div>
              <div className="flex justify-between">
                <span>Číslo objednávky:</span>
                <span className="font-medium">{order.order_number || order.id}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Celková částka:</span>
                <span>{(order.total_amount / 100).toLocaleString()} Kč</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Packeta zásilka - zobrazí se jen pokud má objednávka Packeta výdejní místo */}
        {order.packeta_pickup_point_id && (
          <PacketaShipmentCard
            orderId={order.id}
            hasPacketaPickupPoint={!!order.packeta_pickup_point_id}
            packetaLabelId={order.packeta_label_id}
            packetaTrackingNumber={order.packeta_tracking_number}
            packetaPickupPointName={order.packeta_pickup_point_name}
          />
        )}

        {/* Objednané produkty */}
        <Card>
          <CardHeader>
            <CardTitle>Objednané produkty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.order_items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{item.products?.name || "Neznámý produkt"}</p>
                    <p className="text-sm text-muted-foreground">Množství: {item.quantity}x</p>
                    {item.product_variants?.size && (
                      <p className="text-sm text-muted-foreground">
                        Velikost: {item.product_variants.size}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {((item.price * item.quantity) / 100).toLocaleString()} Kč
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(item.price / 100).toLocaleString()} Kč/ks
                    </p>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center font-medium text-lg">
                <span>Celkem:</span>
                <span>{(order.total_amount / 100).toLocaleString()} Kč</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
