import { AdminHeader } from "@/components/admin-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdminOrEditor } from "@/lib/supabase-auth";
import { getOrders } from "@/lib/supabase-queries";
import { OrderRow } from "./order-row";

export default async function OrdersPage() {
  const _user = await requireAdminOrEditor();
  const orders = await getOrders();

  const total = orders.length;
  const paid = orders.filter((o: any) => o.status === "paid" || o.payment_status === "paid").length;
  const processing = orders.filter((o: any) => o.status === "processing").length;
  const shipped = orders.filter((o: any) => o.status === "shipped").length;
  const revenue = orders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);

  const formatCZK = (amount: number) => new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK" }).format(amount / 100);

  return (
    <>
      <AdminHeader
        title="Objednávky"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Objednávky" }]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Počet objednávek</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Zaplacené</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paid}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Ve zpracování</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{processing}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Odeslané</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shipped}</div>
            </CardContent>
          </Card>
          <Card className="sm:col-span-2 lg:col-span-4">
            <CardHeader>
              <CardTitle>Tržby</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCZK(revenue)}</div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Seznam objednávek ({total})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Input placeholder="Filtrovat podle zákazníka..." className="max-w-sm" />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Číslo objednávky</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Zákazník</TableHead>
                  <TableHead>Částka</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Doprava</TableHead>
                  <TableHead>Akce</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders && orders.length > 0 ? (
                  orders.map((order) => (
                    <OrderRow key={order.id} order={order} />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Žádné objednávky nenalezeny
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
