"use client"
import { DataTable } from "@/components/data-table"
import { ordersColumns, type Order } from "./orders-table-columns"

interface OrdersTableProps {
  data: Order[]
}

export function OrdersTable({ data }: OrdersTableProps) {
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={ordersColumns} data={data} searchColumn="customerName" />
    </div>
  )
}
