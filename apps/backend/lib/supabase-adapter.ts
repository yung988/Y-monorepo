"use client"

import { createBrowserClient } from "@/lib/supabase"

// Adaptér pro práci s existujícími daty
export class SupabaseAdapter {
  private supabase = createBrowserClient()

  // Univerzální metoda pro získání dat z jakékoli tabulky
  async getTableData(
    tableName: string,
    options?: {
      select?: string
      limit?: number
      orderBy?: { column: string; ascending?: boolean }
      filters?: Array<{ column: string; operator: string; value: any }>
    },
  ) {
    let query = this.supabase.from(tableName)

    if (options?.select) {
      query = query.select(options.select)
    } else {
      query = query.select("*")
    }

    if (options?.filters) {
      options.filters.forEach((filter) => {
        switch (filter.operator) {
          case "eq":
            query = query.eq(filter.column, filter.value)
            break
          case "neq":
            query = query.neq(filter.column, filter.value)
            break
          case "gt":
            query = query.gt(filter.column, filter.value)
            break
          case "gte":
            query = query.gte(filter.column, filter.value)
            break
          case "lt":
            query = query.lt(filter.column, filter.value)
            break
          case "lte":
            query = query.lte(filter.column, filter.value)
            break
          case "like":
            query = query.like(filter.column, filter.value)
            break
          case "in":
            query = query.in(filter.column, filter.value)
            break
        }
      })
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true })
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error(`Error fetching data from ${tableName}:`, error)
      throw error
    }

    return data
  }

  // Metoda pro získání struktury tabulky
  async getTableStructure(tableName: string) {
    const { data, error } = await this.supabase
      .from("information_schema.columns")
      .select("column_name, data_type, is_nullable, column_default")
      .eq("table_name", tableName)
      .eq("table_schema", "public")

    if (error) {
      console.error(`Error fetching structure for ${tableName}:`, error)
      throw error
    }

    return data
  }

  // Metoda pro získání seznamu všech tabulek
  async getAllTables() {
    const { data, error } = await this.supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .not("table_name", "like", "_%") // Vyloučit systémové tabulky

    if (error) {
      console.error("Error fetching tables:", error)
      throw error
    }

    return data?.map((t) => t.table_name) || []
  }

  // Adaptované metody pro dashboard
  async getDashboardData() {
    try {
      const tables = await this.getAllTables()
      console.log("Available tables:", tables)

      // Pokusíme se získat data z dostupných tabulek
      const dashboardData: any = {
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        recentOrders: [],
      }

      // Produkty
      if (tables.includes("products")) {
        const products = await this.getTableData("products", { limit: 1000 })
        dashboardData.totalProducts = products?.length || 0
      }

      // Objednávky
      if (tables.includes("orders")) {
        const orders = await this.getTableData("orders", {
          limit: 1000,
          orderBy: { column: "created_at", ascending: false },
        })

        dashboardData.totalOrders = orders?.length || 0

        // Výpočet celkových tržeb
        if (orders) {
          dashboardData.totalRevenue = orders.reduce((sum: number, order: any) => {
            const amount = order.total_amount || order.amount || order.total || 0
            return sum + (typeof amount === "number" ? amount : Number.parseFloat(amount) || 0)
          }, 0)

          // Nedávné objednávky
          dashboardData.recentOrders = orders.slice(0, 5).map((order: any) => ({
            id: order.id,
            orderNumber: order.order_number || order.id,
            customerName: order.customer_name || order.customerName || "Neznámý zákazník",
            amount: order.total_amount || order.amount || order.total || 0,
            status: order.status || "pending",
            date: order.created_at || order.orderDate || new Date().toISOString(),
          }))
        }
      }

      // Zákazníci
      if (tables.includes("customers")) {
        const customers = await this.getTableData("customers", { limit: 1000 })
        dashboardData.totalCustomers = customers?.length || 0
      }

      return dashboardData
    } catch (error) {
      console.error("Error getting dashboard data:", error)
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        recentOrders: [],
      }
    }
  }

  // Adaptované metody pro produkty
  async getProducts() {
    try {
      const products = await this.getTableData("products", {
        orderBy: { column: "created_at", ascending: false },
      })

      return (
        products?.map((product: any) => ({
          id: product.id,
          name: product.name || product.title || "Bez názvu",
          category: product.category || "Nezařazeno",
          price: product.price || 0,
          stock: product.stock || product.quantity || 0,
          status: product.status || "active",
        })) || []
      )
    } catch (error) {
      console.error("Error getting products:", error)
      return []
    }
  }

  // Adaptované metody pro objednávky
  async getOrders() {
    try {
      const orders = await this.getTableData("orders", {
        orderBy: { column: "created_at", ascending: false },
      })

      return (
        orders?.map((order: any) => ({
          id: order.id,
          customerName: order.customer_name || order.customerName || "Neznámý zákazník",
          amount: order.total_amount || order.amount || order.total || 0,
          status: order.status || "pending",
          orderDate: order.created_at || order.orderDate || new Date().toISOString(),
        })) || []
      )
    } catch (error) {
      console.error("Error getting orders:", error)
      return []
    }
  }

  // Adaptované metody pro zákazníky
  async getCustomers() {
    try {
      const customers = await this.getTableData("customers", {
        orderBy: { column: "created_at", ascending: false },
      })

      return (
        customers?.map((customer: any) => ({
          id: customer.id,
          name: customer.name || customer.firstName + " " + customer.lastName || "Neznámý zákazník",
          email: customer.email || "",
          totalOrders: customer.total_orders || customer.totalOrders || 0,
          totalRevenue: customer.total_revenue || customer.totalRevenue || 0,
          lastOrderDate: customer.last_order_date || customer.lastOrderDate || null,
        })) || []
      )
    } catch (error) {
      console.error("Error getting customers:", error)
      return []
    }
  }
}

export const supabaseAdapter = new SupabaseAdapter()
