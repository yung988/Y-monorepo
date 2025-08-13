"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Order = {
  id: string
  customerName: string
  amount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  orderDate: string
}

export const ordersColumns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "ID Objednávky",
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
    header: "Stav",
    cell: ({ row }) => {
      const status = row.getValue("status") as Order["status"]
      const getStatusBadge = (status: Order["status"]) => {
        switch (status) {
          case "pending":
            return <Badge variant="outline">Čekající</Badge>
          case "processing":
            return <Badge variant="secondary">Zpracovává se</Badge>
          case "shipped":
            return <Badge className="bg-blue-500 hover:bg-blue-500/80 text-white">Odesláno</Badge>
          case "delivered":
            return <Badge className="bg-green-500 hover:bg-green-500/80 text-white">Doručeno</Badge>
          case "cancelled":
            return <Badge variant="destructive">Zrušeno</Badge>
          default:
            return <Badge variant="outline">{status}</Badge>
        }
      }
      return getStatusBadge(status)
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
            <DropdownMenuItem>Zobrazit detaily objednávky</DropdownMenuItem>
            <DropdownMenuItem>Upravit objednávku</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
