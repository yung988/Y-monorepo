"use client"

import { DataTable } from "@/components/data-table"
import { productsColumns, type Product } from "./products-table-columns"

interface ProductsTableProps {
  data: Product[]
}

export function ProductsTable({ data }: ProductsTableProps) {
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={productsColumns} data={data} searchColumn="name" />
    </div>
  )
}
