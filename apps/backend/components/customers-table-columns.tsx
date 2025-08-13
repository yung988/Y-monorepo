"use client"

import type { ColumnDef } from "@tanstack/react-table"
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

export type Customer = {
  id: string
  name: string
  email: string
  totalOrders: number
  totalRevenue: number
  lastOrderDate: string
}

export const customersColumns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Jméno
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "totalOrders",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Celkem objednávek
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="text-center">{row.getValue("totalOrders")}</div>,
  },
  {
    accessorKey: "totalRevenue",
    header: () => <div className="text-right">Celkové příjmy</div>,
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("totalRevenue"))
      const formatted = new Intl.NumberFormat("cs-CZ", {
        style: "currency",
        currency: "CZK",
      }).format(amount)

      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "lastOrderDate",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Poslední objednávka
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const customer = row.original

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(customer.id)}>
              Kopírovat ID zákazníka
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Zobrazit detaily zákazníka</DropdownMenuItem>
            <DropdownMenuItem>Upravit zákazníka</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
