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

export type Product = {
  id: string
  name: string
  category: string
  price: number
  stock: number
  status: "available" | "out_of_stock" | "discontinued"
}

export const productsColumns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Název produktu
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "category",
    header: "Kategorie",
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Cena</div>,
    cell: ({ row }) => {
      const price = Number.parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("cs-CZ", {
        style: "currency",
        currency: "CZK",
      }).format(price)

      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Skladem
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const stock = row.getValue("stock") as number
      const getStockBadge = (stock: number) => {
        if (stock > 10) {
          return <Badge className="bg-green-500 hover:bg-green-500/80 text-white">Skladem ({stock})</Badge>
        } else if (stock > 0) {
          return <Badge variant="secondary">Nízký stav ({stock})</Badge>
        } else {
          return <Badge variant="destructive">Vyprodáno</Badge>
        }
      }
      return getStockBadge(stock)
    },
  },
  {
    accessorKey: "status",
    header: "Stav",
    cell: ({ row }) => {
      const status = row.getValue("status") as Product["status"]
      const getStatusBadge = (status: Product["status"]) => {
        switch (status) {
          case "available":
            return <Badge className="bg-green-500 hover:bg-green-500/80 text-white">Dostupné</Badge>
          case "out_of_stock":
            return <Badge variant="destructive">Vyprodáno</Badge>
          case "discontinued":
            return <Badge variant="outline">Ukončeno</Badge>
          default:
            return <Badge variant="outline">{status}</Badge>
        }
      }
      return getStatusBadge(status)
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const product = row.original

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(product.id)}>
              Kopírovat ID produktu
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Zobrazit detaily produktu</DropdownMenuItem>
            <DropdownMenuItem>Upravit produkt</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
