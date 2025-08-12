"use client"
import { DataTable } from "@/components/data-table"
import { customersColumns, type Customer } from "./customers-table-columns"

interface CustomersTableProps {
  data: Customer[]
}

export function CustomersTable({ data }: CustomersTableProps) {
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={customersColumns} data={data} searchColumn="name" />
    </div>
  )
}
