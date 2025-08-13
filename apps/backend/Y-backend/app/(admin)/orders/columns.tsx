"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle2, Eye, Mail, MoreHorizontal, Trash2, Download, Package, Clock, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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
  }).format(amount / 100); // Assuming amount is in cents
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
          weight: parseFloat(weight) * 1000, // Convert to grams
          width: parseFloat(width),
          height: parseFloat(height),
          depth: parseFloat(depth),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Chyba při vytváření zásilky");
      }

      const data = await res.json();
      toast.success(`Zásilka ${data.shipment?.barcode || 'byla'} vytvořena!`);
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
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button size="sm" className="h-7 px-2">
              <Package className="mr-1 h-3 w-3" /> Odeslat
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Vytvořit Packeta zásilku</p>
        </TooltipContent>
      </Tooltip>
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

const CellActions = ({ order }: { order: Order }) => {
  const router = useRouter();
  const [cancelProcessing, setCancelProcessing] = useState(false);
  const [emailProcessing, setEmailProcessing] = useState(false);



  const handleCancelShipment = async () => {
    setCancelProcessing(true);
    const promise = fetch(`/api/admin/orders/${order.id}/packeta/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    toast.promise(promise, {
      loading: "Ruším zásilku...",
      success: async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Neznámá chyba");
        }
        router.refresh();
        return "Zásilka byla zrušena";
      },
      error: (err) => `Chyba: ${err.message}`,
      finally: () => setCancelProcessing(false),
    });
  };

  const handleSendTrackingEmail = async () => {
    setEmailProcessing(true);
    const promise = fetch(`/api/admin/orders/${order.id}/packeta/send-tracking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    toast.promise(promise, {
      loading: "Odesílám sledovací číslo...",
      success: async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Neznámá chyba");
        }
        return "Sledovací číslo bylo odesláno zákazníkovi";
      },
      error: (err) => `Chyba: ${err.message}`,
      finally: () => setEmailProcessing(false),
    });
  };

  const handleDownloadLabel = async () => {
    try {
      const response = await fetch(`/api/packeta/generate-labels`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderIds: [order.id] }) });
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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Neznámá chyba";
      toast.error(`Chyba při stahování štítku: ${message}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Otevřít menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Akce</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/orders/${order.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            Zobrazit detail
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {order.packeta_label_id && (
          <>
            <DropdownMenuItem onClick={handleDownloadLabel}>
              <Download className="mr-2 h-4 w-4" />
              Stáhnout štítek
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSendTrackingEmail} disabled={emailProcessing}>
              <Mail className="mr-2 h-4 w-4" />
              {emailProcessing ? "Odesílám..." : "Odeslat sledovací číslo"}
            </DropdownMenuItem>
            {!order.packeta_printed && (
              <DropdownMenuItem onClick={handleCancelShipment} disabled={cancelProcessing}>
                <Trash2 className="mr-2 h-4 w-4" />
                {cancelProcessing ? "Ruším..." : "Zrušit zásilku"}
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<Order>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Vybrat všechny"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Vybrat řádek"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "order_number",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Číslo objednávky
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const order = row.original;
      const orderNumber = order.order_number || order.id.slice(0, 8);

      return (
        <ContextMenu>
          <ContextMenuTrigger>
            <Link
              href={`/orders/${order.id}`}
              className="font-medium hover:underline text-blue-600"
            >
              #{orderNumber}
            </Link>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem asChild>
              <Link href={`/orders/${order.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Zobrazit detail
              </Link>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => navigator.clipboard.writeText(`${order.id}`)}>
              Zkopírovat ID
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Datum
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <div className="text-sm">{date.toLocaleDateString("cs-CZ")}</div>;
    },
  },
  {
    accessorKey: "customer_name",
    header: "Zákazník",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div>
          <div className="font-medium">{order.customer_name || "—"}</div>
          <div className="text-sm text-muted-foreground">{order.customer_email}</div>
          {order.customer_phone && (
            <div className="text-xs text-muted-foreground">{order.customer_phone}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="justify-end"
        >
          Částka
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="text-right font-medium">
          {formatPrice(order.total_amount, order.currency)}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const order = row.original;
      const status = row.getValue("status") as string;
      const badge = getStatusBadge(status);
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
            const err = await res.json();
            throw new Error(err.error || "Nepodařilo se změnit stav");
          }
          toast.success("Stav objednávky změněn");
          // Optimistic UI update
          (row as any).original.status = next;
          // Refresh the page to show updated data
          window.location.reload();
        } catch (e: any) {
          toast.error(e?.message || "Chyba při změně stavu");
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 px-2">
              <span className="mr-2">
                <Badge variant={badge.variant}>{badge.label}</Badge>
              </span>
              <ArrowUpDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {statuses.map((s) => (
              <DropdownMenuItem key={s} onClick={() => updateStatus(s)}>
                {getStatusBadge(s).label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    accessorKey: "shipping_method",
    header: "Doprava",
    cell: ({ row }) => {
      const order = row.original;

      if (order.packeta_pickup_point_id || order.shipping_method === "Packeta") {
        // Určení statusu zásilky
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-xs text-muted-foreground truncate max-w-32 cursor-help">
                      {order.packeta_pickup_point_name}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{order.packeta_pickup_point_name}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {order.packeta_tracking_number && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-xs text-muted-foreground font-mono cursor-help">
                      {order.packeta_tracking_number}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sledovací číslo: {order.packeta_tracking_number}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <div className="mt-1 flex gap-1">
                {!order.packeta_label_id && (order.packeta_pickup_point_id || order.shipping_method === "Packeta") && (
                  <PacketaCreateDialog order={order} />
                )}
                {order.packeta_label_id && (
                  <Tooltip>
                    <TooltipTrigger asChild>
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
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Stáhnout PDF štítek</p>
                    </TooltipContent>
                  </Tooltip>
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
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const order = row.original;

      return <CellActions order={order} />;
    },
  },
];
