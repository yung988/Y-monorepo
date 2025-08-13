"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Package } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export type AdaptedProduct = {
  id: string
  name: string
  category: string
  price: number
  stock: number
  status: string
  sku?: string
  weight?: number
  mainImage?: string
  variants: Array<{
    id: string
    size: string
    stock_quantity: number
    sku: string
  }>
}

export const adaptedProductsColumns: ColumnDef<AdaptedProduct>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Produkt
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={row.original.mainImage || "/placeholder.svg"} alt={row.getValue("name")} />
          <AvatarFallback>
            <Package className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{row.getValue("name")}</div>
          {row.original.sku && <div className="text-sm text-muted-foreground">SKU: {row.original.sku}</div>}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Kategorie",
    cell: ({ row }) => <Badge variant="outline">{row.getValue("category")}</Badge>,
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
      const variants = row.original.variants

      const getStockBadge = (stock: number) => {
        if (stock > 10) {
          return <Badge className="bg-green-500 hover:bg-green-500/80 text-white">Skladem ({stock})</Badge>
        } else if (stock > 0) {
          return <Badge variant="secondary">Nízký stav ({stock})</Badge>
        } else {
          return <Badge variant="destructive">Vyprodáno</Badge>
        }
      }

      return (
        <div className="space-y-1">
          {getStockBadge(stock)}
          {variants && variants.length > 1 && (
            <div className="text-xs text-muted-foreground">
              {variants.length} variant{variants.length > 1 ? "y" : "a"}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Stav",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const getStatusBadge = (status: string) => {
        switch (status) {
          case "active":
            return <Badge className="bg-green-500 hover:bg-green-500/80 text-white">Aktivní</Badge>
          case "inactive":
            return <Badge variant="secondary">Neaktivní</Badge>
          case "draft":
            return <Badge variant="outline">Koncept</Badge>
          default:
            return <Badge variant="outline">{status}</Badge>
        }
      }
      return getStatusBadge(status)
    },
  },
  {
    accessorKey: "weight",
    header: "Hmotnost",
    cell: ({ row }) => {
      const weight = row.original.weight
      return weight ? `${weight} kg` : "—"
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
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              Zobrazit detail
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Upravit produkt
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Spravovat varianty</DropdownMenuItem>
            <DropdownMenuItem>Upravit obrázky</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
