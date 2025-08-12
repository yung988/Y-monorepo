"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, Eye, Truck, Package } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateOrderStatus } from "@/lib/supabase-queries-adapted"
import { useToast } from "@/hooks/use-toast"

export type AdaptedOrder = {
  id: string
  customerName: string
  customerEmail: string
  amount: number
  status: string
  paymentStatus: string
  orderDate: string
  orderNumber: string
  shippingMethod?: string
  trackingNumber?: string
}

export const adaptedOrdersColumns: ColumnDef<AdaptedOrder>[] = [
  {
    accessorKey: "orderNumber",
    header: "Číslo objednávky",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("orderNumber") || `#${row.original.id.slice(0, 8)}`}</div>
    ),
  },
  {
    accessorKey: "customerName",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Zákazník
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.getValue("customerName")}</div>
        <div className="text-sm text-muted-foreground">{row.original.customerEmail}</div>
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Částka</div>,
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("cs-CZ", {
        style: "currency",
        currency: "CZK",
      }).format(amount)

      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Stav objednávky",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const { toast } = useToast()

      const handleStatusChange = async (newStatus: string) => {
        try {
          await updateOrderStatus(row.original.id, newStatus)
          toast({
            title: "Stav aktualizován",
            description: `Objednávka byla změněna na ${newStatus}`,
          })
          // Refresh page or update state
          window.location.reload()
        } catch (error) {
          toast({
            title: "Chyba",
            description: "Nepodařilo se aktualizovat stav objednávky",
            variant: "destructive",
          })
        }
      }

      return (
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Čekající</SelectItem>
            <SelectItem value="confirmed">Potvrzeno</SelectItem>
            <SelectItem value="processing">Zpracovává se</SelectItem>
            <SelectItem value="shipped">Odesláno</SelectItem>
            <SelectItem value="delivered">Doručeno</SelectItem>
            <SelectItem value="cancelled">Zrušeno</SelectItem>
          </SelectContent>
        </Select>
      )
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Platba",
    cell: ({ row }) => {
      const paymentStatus = row.getValue("paymentStatus") as string
      const getPaymentBadge = (status: string) => {
        switch (status) {
          case "paid":
            return <Badge className="bg-green-500 hover:bg-green-500/80 text-white">Zaplaceno</Badge>
          case "pending":
            return <Badge variant="secondary">Čekající</Badge>
          case "failed":
            return <Badge variant="destructive">Neúspěšná</Badge>
          case "refunded":
            return <Badge variant="outline">Vráceno</Badge>
          default:
            return <Badge variant="outline">{status}</Badge>
        }
      }
      return getPaymentBadge(paymentStatus)
    },
  },
  {
    accessorKey: "shippingMethod",
    header: "Doprava",
    cell: ({ row }) => {
      const shippingMethod = row.original.shippingMethod
      const trackingNumber = row.original.trackingNumber

      return (
        <div className="flex items-center gap-2">
          {shippingMethod && (
            <Badge variant="outline" className="text-xs">
              {shippingMethod}
            </Badge>
          )}
          {trackingNumber && (
            <div className="flex items-center gap-1">
              <Truck className="h-3 w-3" />
              <span className="text-xs font-mono">{trackingNumber}</span>
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "orderDate",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Datum objednávky
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("orderDate"))
      return date.toLocaleDateString("cs-CZ")
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const order = row.original

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(order.id)}>
              Kopírovat ID objednávky
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              Zobrazit detaily
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Package className="mr-2 h-4 w-4" />
              Vytisknout štítek
            </DropdownMenuItem>
            {order.trackingNumber && (
              <DropdownMenuItem>
                <Truck className="mr-2 h-4 w-4" />
                Sledovat zásilku
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
