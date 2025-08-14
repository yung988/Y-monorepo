import { CheckCircle, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type OrderItem = {
  product_id: string;
  product_name: string;
  product_size?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image?: string;
};

export type Order = {
  id: string;
  order_number?: string;
  packeta_tracking_url?: string;
  stripe_session_id?: string;
  customer_email: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  billing_street: string;
  billing_city: string;
  billing_postal_code: string;
  billing_country: string;
  pickup_point_name?: string;
  pickup_point_street?: string;
  pickup_point_city?: string;
  pickup_point_zip?: string;
  subtotal: number;
  delivery_price: number;
  total_price: number;
  currency: string;
  status: string;
  payment_status?: string;
  created_at: string;
  items: OrderItem[];
};

import { adminApi } from "@/lib/admin-api";

async function fetchOrder(orderId: string, token: string): Promise<Order> {
  return await adminApi.getOrder(orderId, token);
}

export const dynamic = "force-dynamic";
import ClearCartClient from "../../components/checkout/ClearCartClient"

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const orderIdParam = (params.order_id ?? params.orderId) as string | string[] | undefined;
  const orderId = Array.isArray(orderIdParam) ? orderIdParam[0] : (orderIdParam ?? null);
  const accessToken = Array.isArray(params.token) ? params.token[0] : (params.token ?? null);

  if (!orderId) {
    return (
      <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black border border-white/10 rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-4">Objednávka nebyla nalezena</h1>
            <p className="text-white/70">
              Nepodařilo se načíst informace o objednávce. Zkontrolujte prosím URL adresu.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-white text-white hover:bg-white hover:text-black transition-colors"
            >
              Zpět na úvodní stránku
            </Link>
          </div>
        </div>
      </div>
    );
  }

  let order: Order;
  try {
    order = await fetchOrder(orderId, accessToken!);
  } catch (_error) {
    return (
      <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black border border-white/10 rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-4">Chyba při načítání objednávky</h1>
            <p className="text-white/70">
              Nepodařilo se načíst informace o objednávce. Zkuste to prosím později.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-white text-white hover:bg-white hover:text-black transition-colors"
            >
              Zpět na úvodní stránku
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <ClearCartClient />
        <div className="bg-white border border-black/10 rounded-lg overflow-hidden">
          <div className="px-6 py-8 sm:px-10">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-black" />
              <h1 className="ml-3 text-2xl font-bold">Děkujeme za vaši objednávku!</h1>
            </div>
            <p className="mt-2 text-black/70">
              Potvrzení objednávky bylo odesláno na váš e-mail {order.customer_email}.
              {order.packeta_tracking_url &&
                " Sledovací číslo zásilky vám přijde na e-mail, jakmile bude balík odeslán."}
            </p>
          </div>

          <div className="px-6 py-8 sm:px-10">
            <h2 className="text-lg font-medium mb-6">Přehled objednávky</h2>

            <div className="space-y-6">
              {order.items.map((item, idx) => (
                <div
                  key={`${item.product_id}-${item.product_size || ""}-${idx}`}
                  className="flex items-start border-b border-black/10 pb-6"
                >
                  <div className="flex-shrink-0 h-24 w-24 rounded-md overflow-hidden bg-black/5">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.product_name}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-black/40" />
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex-1">
                    <div className="flex justify-between text-base font-medium">
                      <h3>{item.product_name}</h3>
                      <p className="ml-4">
                        {(item.unit_price / 100).toFixed(2)} {order.currency}
                      </p>
                    </div>
                    {item.product_size && (
                      <p className="mt-1 text-sm text-black/60">Velikost: {item.product_size}</p>
                    )}
                    <p className="mt-1 text-sm text-black/60">Množství: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-black/10 pt-6">
              <h2 className="text-lg font-medium mb-4">Souhrn objednávky</h2>
              <dl className="space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-black/70">Mezisoučet</dt>
                  <dd className="text-sm font-medium">
                    {(order.subtotal / 100).toFixed(2)} {order.currency}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-black/70">Doprava</dt>
                  <dd className="text-sm font-medium">
                    {(order.delivery_price / 100).toFixed(2)} {order.currency}
                  </dd>
                </div>
                <div className="flex items-center justify-between text-base font-medium pt-4 border-t border-black/10">
                  <dt>Celkem</dt>
                  <dd>
                    {(order.total_price / 100).toFixed(2)} {order.currency}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-8 border-t border-black/10 pt-6">
              <h2 className="text-lg font-medium mb-4">Doručovací údaje</h2>
              <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-black/70">Doručovací adresa</h3>
                  <address className="mt-2 text-sm not-italic text-black/70">
                    <div>
                      {order.customer_first_name} {order.customer_last_name}
                    </div>
                    <div>{order.billing_street}</div>
                    <div>
                      {order.billing_postal_code} {order.billing_city}
                    </div>
                    <div>{order.billing_country}</div>
                    <div className="mt-1">{order.customer_phone}</div>
                    <div>{order.customer_email}</div>
                  </address>
                </div>

                {order.pickup_point_name && (
                  <div>
                    <h3 className="text-sm font-medium text-black/70">Výdejní místo</h3>
                    <div className="mt-2 text-sm text-black/70">
                      <div className="font-medium text-black">{order.pickup_point_name}</div>
                      <div>{order.pickup_point_street}</div>
                      <div>
                        {order.pickup_point_zip} {order.pickup_point_city}
                      </div>
                      {order.packeta_tracking_url && (
                        <a
                          href={order.packeta_tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center text-black underline underline-offset-4"
                        >
                          Sledovat zásilku
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 border-t border-black/10 pt-6">
              <h2 className="text-lg font-medium mb-4">Stav objednávky</h2>
              <div className="rounded-md border border-black/10 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-black" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium">
                      {order.payment_status === "paid" ? "Platba přijata" : "Objednávka přijata"}
                    </h3>
                    <div className="mt-2 text-sm text-black/70">
                      <p>
                        {order.payment_status === "paid"
                          ? "Vaše platba byla úspěšně přijata. Objednávka je nyní v procesu zpracování."
                          : "Vaše objednávka byla úspěšně přijata a čeká na zpracování."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <Link
                href="/"
                className="rounded-md border border-black px-4 py-2 text-sm font-medium text-black hover:bg-black hover:text-white transition-colors"
              >
                Zpět do obchodu
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}