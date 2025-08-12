"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { 
  ArrowUpDown, 
  CheckCircle2, 
  Clock, 
  Download, 
  Eye, 
  Mail, 
  MoreHorizontal, 
  Package, 
  Trash2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type Order = {
  id: string;
  order_number?: string;
  customer_name?: string;
  customer_email: string;
  customer_phone?: string;
  total_amount: number;
  currency: string;
  status: string;
  payment_status: string;
  shipping_method?: string;
  packeta_pickup_point_id?: string;
  packeta_pickup_point_name?: string;
  packeta_label_id?: string;
  packeta_tracking_number?: string;
  packeta_printed?: boolean;
  packeta_printed_at?: string;
  created_at: string;
  updated_at: string;
};

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
    statusMap[status as keyof typeof statusMap] || { label: status, variant: "secondary" as const }
  );
};

const formatPrice = (amount: number, currency: string = "CZK") => {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: currency,
  }).format(amount / 100);
};

const PacketaCreateDialog = ({ order }: { order: Order }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [weight, setWeight] = useState("0.5");
  const [width, setWidth] = useState("10");
  const [height, setHeight] = useState("10");
  const [depth, setDepth] = useState("5");

  const handleCreateShipment = async () => {
    setProcessing(true);
    try {
      const res = await fetch("/api/packeta/create-shipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          // kg; pokud je prázdné/neplatné, server si váhu spočítá
          weight: parseFloat(weight),
          width: parseFloat(width),
          height: parseFloat(height),
          depth: parseFloat(depth),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Chyba při vytváření zásilky");
      }

      const payload = await res.json();
      if (!payload?.success) {
        throw new Error(payload?.error || "Chyba při vytváření zásilky");
      }
      const shipment = payload.data?.shipment || payload.shipment;
      toast.success(`Zásilka ${shipment?.barcode || shipment?.id || "byla"} vytvořena!`);
      setIsOpen(false);
      window.location.reload();
    } catch (e: any) {
      toast.error(e?.message || "Chyba při vytváření zásilky");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 px-2">
          <Package className="mr-1 h-3 w-3" /> Odeslat
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vytvořit Packeta Zásilku</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Váha (kg)</Label>
            <Input
              id="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="např. 0.5"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label htmlFor="width">Šířka (cm)</Label>
              <Input
                id="width"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="např. 10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Výška (cm)</Label>
              <Input
                id="height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="např. 10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="depth">Hloubka (cm)</Label>
              <Input
                id="depth"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                placeholder="např. 5"
              />
            </div>
          </div>
        </div>
        <Button onClick={handleCreateShipment} disabled={processing} className="w-full mt-4">
          {processing ? "Vytváření..." : "Potvrdit a vytvořit"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

const StatusCell = ({ order }: { order: Order }) => {
  const badge = getStatusBadge(order.status);
  const statuses = [
    "pending",
    "confirmed",
    "paid",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  const updateStatus = async (next: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Nepodařilo se změnit stav");
      }
      const payload = await res.json();
      if (!payload?.success) {
        throw new Error(payload?.error || "Nepodařilo se změnit stav");
      }
      toast.success("Stav objednávky změněn");
      window.location.reload();
    } catch (e: any) {
      toast.error(e?.message || "Chyba při změně stavu");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 hover:bg-muted transition-colors"
        >
          <Badge variant={badge.variant} className="mr-2">
            {badge.label}
          </Badge>
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel className="font-semibold">Změnit status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {statuses.map((s) => {
          const statusBadge = getStatusBadge(s);
          return (
            <DropdownMenuItem
              key={s}
              onClick={() => updateStatus(s)}
              className="cursor-pointer"
            >
              <Badge variant={statusBadge.variant} className="mr-2 text-xs">
                {statusBadge.label}
              </Badge>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ShippingCell = ({ order }: { order: Order }) => {
  if (order.packeta_pickup_point_id || order.shipping_method === "Packeta") {
    let statusIcon = null;
    let statusColor = "text-gray-500";
    let statusText = "Čeká na vytvoření";

    if (order.packeta_label_id) {
      if (order.packeta_printed) {
        statusIcon = <CheckCircle2 className="h-3 w-3 text-green-600" />;
        statusColor = "text-green-600";
        statusText = "Vytištěno";
      } else {
        statusIcon = <Package className="h-3 w-3 text-blue-600" />;
        statusColor = "text-blue-600";
        statusText = "Vytvořeno";
      }
    } else {
      statusIcon = <Clock className="h-3 w-3 text-orange-500" />;
      statusColor = "text-orange-500";
      statusText = "Čeká na vytvoření";
    }

    return (
      <TooltipProvider>
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <span>Zásilkovna</span>
            <Tooltip>
              <TooltipTrigger asChild>
                {statusIcon}
              </TooltipTrigger>
              <TooltipContent>
                <p>{statusText}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className={`text-xs ${statusColor} font-medium`}>{statusText}</div>
          {order.packeta_pickup_point_name && (
            <div className="text-xs text-muted-foreground truncate max-w-32">
              {order.packeta_pickup_point_name}
            </div>
          )}
          {order.packeta_tracking_number && (
            <div className="text-xs text-muted-foreground font-mono">
              {order.packeta_tracking_number}
            </div>
          )}
          <div className="mt-1 flex gap-1">
            {!order.packeta_label_id && (order.packeta_pickup_point_id || order.shipping_method === "Packeta") && (
              <PacketaCreateDialog order={order} />
            )}
            {order.packeta_label_id && (
              <Button variant="outline" size="sm" className="h-7 px-2" onClick={async () => {
                try {
                  const response = await fetch(`/api/packeta/generate-labels`, { 
                    method: "POST", 
                    headers: { "Content-Type": "application/json" }, 
                    body: JSON.stringify({ orderIds: [order.id] }) 
                  });
                  if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || "Neznámá chyba");
                  }
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `packeta-label-${order.order_number || order.id.slice(0, 8)}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                  toast.success("Štítek byl stažen");
                } catch (e: any) {
                  toast.error(e?.message || "Chyba při stahování štítku");
                }
              }}>
                <Download className="mr-1 h-3 w-3" /> Štítek
              </Button>
            )}
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <span className="text-sm text-muted-foreground">
      {order.shipping_method === "standard" ? "Standardní" : order.shipping_method || "—"}
    </span>
  );
};

export function OrderRow({ order }: { order: Order }) {
  const [cancelProcessing, setCancelProcessing] = useState(false);
  const [emailProcessing, setEmailProcessing] = useState(false);

  const handleCancelShipment = async () => {
    setCancelProcessing(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/packeta/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Neznámá chyba");
      }
      toast.success("Zásilka byla zrušena");
      window.location.reload();
    } catch (e: any) {
      toast.error(e?.message || "Chyba při rušení zásilky");
    } finally {
      setCancelProcessing(false);
    }
  };

  const handleSendTrackingEmail = async () => {
    setEmailProcessing(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/packeta/send-tracking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Neznámá chyba");
      }
      toast.success("Sledovací číslo bylo odesláno zákazníkovi");
    } catch (e: any) {
      toast.error(e?.message || "Chyba při odesílání emailu");
    } finally {
      setEmailProcessing(false);
    }
  };

  const orderNumber = order.order_number || order.id.slice(0, 8);

  return (
    <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell className="font-mono">
        <Link
          href={`/orders/${order.id}`}
          className="font-semibold hover:underline text-primary transition-colors"
        >
          #{orderNumber}
        </Link>
      </TableCell>
      <TableCell className="text-muted-foreground">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            {new Date(order.created_at).toLocaleDateString("cs-CZ")}
          </span>
          <span className="text-xs">
            {new Date(order.created_at).toLocaleTimeString("cs-CZ", {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col space-y-1">
          <span className="font-medium text-foreground">
            {order.customer_name || "—"}
          </span>
          <span className="text-sm text-muted-foreground">
            {order.customer_email}
          </span>
          {order.customer_phone && (
            <span className="text-xs text-muted-foreground font-mono">
              {order.customer_phone}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="font-semibold text-lg">
          {formatPrice(order.total_amount, order.currency)}
        </div>
      </TableCell>
      <TableCell>
        <StatusCell order={order} />
      </TableCell>
      <TableCell>
        <ShippingCell order={order} />
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
              <span className="sr-only">Otevřít menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-semibold">Akce</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/orders/${order.id}`} className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4" />
                Zobrazit detail
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {order.packeta_label_id && (
              <>
                <DropdownMenuItem
                  onClick={handleSendTrackingEmail}
                  disabled={emailProcessing}
                  className="cursor-pointer"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {emailProcessing ? "Odesílám..." : "Odeslat sledovací číslo"}
                </DropdownMenuItem>
                {!order.packeta_printed && (
                  <DropdownMenuItem
                    onClick={handleCancelShipment}
                    disabled={cancelProcessing}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {cancelProcessing ? "Ruším..." : "Zrušit zásilku"}
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
