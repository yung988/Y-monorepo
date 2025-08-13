"use client"

import { createBrowserClient } from "@/lib/supabase"

// Pomocné funkce pro migraci a doplnění dat
export class SupabaseMigration {
  private supabase = createBrowserClient()

  // Kontrola existence tabulky
  async tableExists(tableName: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", tableName)
      .eq("table_schema", "public")
      .single()

    return !error && !!data
  }

  // Kontrola existence sloupce
  async columnExists(tableName: string, columnName: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("information_schema.columns")
      .select("column_name")
      .eq("table_name", tableName)
      .eq("column_name", columnName)
      .eq("table_schema", "public")
      .single()

    return !error && !!data
  }

  // Generování SQL pro přidání chybějících sloupců
  generateMissingColumnsSQL(tableName: string, existingColumns: string[], requiredColumns: { [key: string]: string }) {
    const missingColumns = Object.keys(requiredColumns).filter((col) => !existingColumns.includes(col))

    if (missingColumns.length === 0) {
      return null
    }

    const alterStatements = missingColumns.map(
      (col) => `ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${col} ${requiredColumns[col]};`,
    )

    return alterStatements.join("\n")
  }

  // Standardizace dat pro dashboard
  async standardizeOrdersData() {
    const { data: orders, error } = await this.supabase.from("orders").select("*").limit(5)

    if (error || !orders) {
      console.log("No orders table or data found")
      return null
    }

    // Analýza struktury objednávek
    const sampleOrder = orders[0]
    const standardFields = {
      id: sampleOrder.id,
      order_number: sampleOrder.order_number || sampleOrder.orderNumber || sampleOrder.id,
      customer_name: sampleOrder.customer_name || sampleOrder.customerName || "Unknown",
      customer_email: sampleOrder.customer_email || sampleOrder.customerEmail || "",
      total_amount: sampleOrder.total_amount || sampleOrder.amount || sampleOrder.total || 0,
      status: sampleOrder.status || "pending",
      created_at: sampleOrder.created_at || sampleOrder.orderDate || new Date().toISOString(),
    }

    return {
      sampleStructure: sampleOrder,
      standardizedStructure: standardFields,
      totalRecords: orders.length,
    }
  }

  // Standardizace dat produktů
  async standardizeProductsData() {
    const { data: products, error } = await this.supabase.from("products").select("*").limit(5)

    if (error || !products) {
      console.log("No products table or data found")
      return null
    }

    const sampleProduct = products[0]
    const standardFields = {
      id: sampleProduct.id,
      name: sampleProduct.name || sampleProduct.title || "Unnamed Product",
      price: sampleProduct.price || 0,
      stock: sampleProduct.stock || sampleProduct.quantity || 0,
      category: sampleProduct.category || sampleProduct.category_id || "Uncategorized",
      status: sampleProduct.status || "active",
      created_at: sampleProduct.created_at || new Date().toISOString(),
    }

    return {
      sampleStructure: sampleProduct,
      standardizedStructure: standardFields,
      totalRecords: products.length,
    }
  }

  // Standardizace dat zákazníků
  async standardizeCustomersData() {
    const { data: customers, error } = await this.supabase.from("customers").select("*").limit(5)

    if (error || !customers) {
      console.log("No customers table or data found")
      return null
    }

    const sampleCustomer = customers[0]
    const standardFields = {
      id: sampleCustomer.id,
      name:
        sampleCustomer.name ||
        `${sampleCustomer.firstName || ""} ${sampleCustomer.lastName || ""}`.trim() ||
        "Unknown Customer",
      email: sampleCustomer.email || "",
      total_orders: sampleCustomer.total_orders || sampleCustomer.totalOrders || 0,
      total_revenue: sampleCustomer.total_revenue || sampleCustomer.totalRevenue || 0,
      created_at: sampleCustomer.created_at || new Date().toISOString(),
    }

    return {
      sampleStructure: sampleCustomer,
      standardizedStructure: standardFields,
      totalRecords: customers.length,
    }
  }

  // Kompletní analýza databáze
  async analyzeDatabase() {
    const analysis = {
      orders: await this.standardizeOrdersData(),
      products: await this.standardizeProductsData(),
      customers: await this.standardizeCustomersData(),
    }

    return analysis
  }
}

export const supabaseMigration = new SupabaseMigration()
