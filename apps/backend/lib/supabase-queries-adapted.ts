import { supabase as browserSupabase } from "@/lib/supabase"
import { createClient as createServerSupabase } from "@/lib/supabase/server"

// Adaptované queries pro tvou existující strukturu
export async function getDashboardStats() {
  const supabase = await createServerSupabase()

  try {
    // Celkové tržby z dokončených objednávek (cena je v haléřích)
    const { data: revenueData, error: revenueError } = await supabase
      .from("orders")
      .select("total_amount")
      .in("status", ["delivered", "completed", "shipped"])

    if (revenueError) throw revenueError
    const totalRevenue = revenueData.reduce((sum, order) => sum + order.total_amount / 100, 0) // Převod z haléřů

    // Počet objednávek
    const { count: totalOrders, error: ordersError } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })

    if (ordersError) throw ordersError

    // Počet aktivních produktů
    const { count: totalProducts, error: productsError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")

    if (productsError) throw productsError

    // Počet unikátních zákazníků (z emailů v objednávkách)
    const { data: customerEmails, error: customersError } = await supabase.from("orders").select("customer_email")

    if (customersError) throw customersError
    const uniqueCustomers = new Set(customerEmails?.map((order) => order.customer_email)).size

    // Nedávné objednávky s detaily
    const { data: recentOrders, error: recentOrdersError } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        customer_name,
        customer_email,
        total_amount,
        status,
        payment_status,
        created_at,
        shipping_method,
        packeta_tracking_number
      `)
      .order("created_at", { ascending: false })
      .limit(5)

    if (recentOrdersError) throw recentOrdersError

    return {
      totalRevenue: Math.round(totalRevenue || 0),
      totalOrders: totalOrders || 0,
      totalCustomers: uniqueCustomers || 0,
      totalProducts: totalProducts || 0,
      recentOrders:
        recentOrders?.map((order) => ({
          id: order.id,
          orderNumber: order.order_number || order.id,
          customerName: order.customer_name || order.customer_email,
          amount: order.total_amount / 100, // Převod z haléřů na koruny
          status: order.status,
          paymentStatus: order.payment_status,
          date: order.created_at,
          trackingNumber: order.packeta_tracking_number,
        })) || [],
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
      recentOrders: [],
    }
  }
}

// Získání objednávek s detaily
export async function getOrders(limit?: number) {
  const supabase = await createServerSupabase()

  let query = supabase
    .from("orders")
    .select(`
      *,
      order_items(
        id,
        quantity,
        price,
        size,
        product:products(
          name,
          sku
        ),
        variant:product_variants(
          size,
          sku
        )
      )
    `)
    .order("created_at", { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching orders:", error)
    return []
  }

  return (
    data?.map((order) => ({
      id: order.id,
      customerName: order.customer_name || order.customer_email,
      customerEmail: order.customer_email,
      amount: order.total_amount / 100, // Převod z haléřů
      status: order.status,
      paymentStatus: order.payment_status,
      orderDate: order.created_at,
      orderNumber: order.order_number,
      shippingMethod: order.shipping_method,
      trackingNumber: order.packeta_tracking_number,
      items: order.order_items || [],
    })) || []
  )
}

// Získání produktů s variantami a obrázky
export async function getProducts(limit?: number) {
  const supabase = await createServerSupabase()

  let query = supabase
    .from("products")
    .select(`
      *,
      product_variants(
        id,
        size,
        sku,
        stock_quantity,
        price_override,
        status
      ),
      product_images(
        id,
        url,
        alt_text,
        sort_order,
        is_main_image
      )
    `)
    .order("created_at", { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return (
    data?.map((product) => {
      const totalStock = product.product_variants?.reduce((sum, variant) => sum + (variant?.stock_quantity || 0), 0) || 0
      const mainImage =
        product.product_images?.find((img) => img.is_main_image)?.url || product.product_images?.[0]?.url

      return {
        id: product.id,
        name: product.name,
        category: product.category || "Nezařazeno",
        price: product.price / 100, // Převod z haléřů (koruny v UI)
        stock: totalStock,
        status: product.status,
        sku: product.sku,
        description: product.description,
        weight: product.weight,
        slug: product.slug,
        mainImage,
        product_variants: product.product_variants || [],
        product_images: product.product_images || [],
      }
    }) || []
  )
}

// Získání zákazníků z objednávek
export async function getCustomers(limit?: number) {
  const supabase = await createServerSupabase()

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      customer_email,
      customer_name,
      customer_phone,
      total_amount,
      status,
      created_at
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching customer data:", error)
    return []
  }

  // Agregace dat podle emailu zákazníka
  const customerMap = new Map()

  orders?.forEach((order) => {
    const email = order.customer_email
    if (!customerMap.has(email)) {
      customerMap.set(email, {
        id: email, // Použijeme email jako ID
        name: order.customer_name || email,
        email: email,
        phone: order.customer_phone,
        totalOrders: 0,
        totalRevenue: 0,
        lastOrderDate: order.created_at,
        firstOrderDate: order.created_at,
      })
    }

    const customer = customerMap.get(email)
    customer.totalOrders += 1
    customer.totalRevenue += order.total_amount / 100 // Převod z haléřů

    // Aktualizace posledního a prvního data objednávky
    if (new Date(order.created_at) > new Date(customer.lastOrderDate)) {
      customer.lastOrderDate = order.created_at
    }
    if (new Date(order.created_at) < new Date(customer.firstOrderDate)) {
      customer.firstOrderDate = order.created_at
    }

    // Aktualizace jména a telefonu (pokud je novější)
    if (order.customer_name && !customer.name.includes("@")) {
      customer.name = order.customer_name
    }
    if (order.customer_phone && !customer.phone) {
      customer.phone = order.customer_phone
    }
  })

  const customers = Array.from(customerMap.values()).sort(
    (a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime(),
  )

  return limit ? customers.slice(0, limit) : customers
}

// Analytická data pro grafy
export async function getAnalyticsData() {
  const supabase = await createServerSupabase()

  try {
    // Měsíční tržby za posledních 6 měsíců
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: monthlyOrders, error: ordersError } = await supabase
      .from("orders")
      .select("total_amount, created_at, status")
      .gte("created_at", sixMonthsAgo.toISOString())
      .order("created_at", { ascending: true })

    if (ordersError) throw ordersError

    // Zpracování dat pro grafy
    const monthlyData = new Map()
    const months = ["Led", "Úno", "Bře", "Dub", "Kvě", "Čer", "Čvc", "Srp", "Zář", "Říj", "Lis", "Pro"]

    monthlyOrders?.forEach((order) => {
      const date = new Date(order.created_at)
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthKey,
          revenue: 0,
          orders: 0,
          customers: new Set(),
        })
      }

      const monthData = monthlyData.get(monthKey)
      monthData.revenue += order.total_amount / 100 // Převod z haléřů
      monthData.orders += 1
    })

    // Převod na pole pro grafy
    const chartData = Array.from(monthlyData.values())
      .slice(-6)
      .map((data) => ({
        month: data.month,
        revenue: Math.round(data.revenue),
        orders: data.orders,
        customers: data.customers.size,
      }))

    return {
      revenue: chartData,
      orders: chartData,
      customers: chartData,
    }
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return {
      revenue: [],
      orders: [],
      customers: [],
    }
  }
}

// Získání zásilek s Packeta informacemi
export async function getShipments() {
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      customer_name,
      customer_email,
      total_amount,
      status,
      shipping_method,
      packeta_pickup_point_name,
      packeta_tracking_number,
      packeta_label_url,
      packeta_tracking_url,
      shipped_at,
      delivered_at,
      created_at
    `)
    .not("shipping_method", "is", null)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching shipments:", error)
    return []
  }

  return (
    data?.map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name || order.customer_email,
      totalAmount: order.total_amount / 100,
      status: order.status,
      shippingMethod: order.shipping_method,
      pickupPoint: order.packeta_pickup_point_name,
      trackingNumber: order.packeta_tracking_number,
      labelUrl: order.packeta_label_url,
      trackingUrl: order.packeta_tracking_url,
      shippedAt: order.shipped_at,
      deliveredAt: order.delivered_at,
      createdAt: order.created_at,
    })) || []
  )
}

// Aktualizace stavu objednávky
export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = browserSupabase

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  }

  // Automatické nastavení časových razítek
  if (status === "shipped") {
    updateData.shipped_at = new Date().toISOString()
  } else if (status === "delivered") {
    updateData.delivered_at = new Date().toISOString()
  }

  const { data, error } = await supabase.from("orders").update(updateData).eq("id", orderId).select()

  if (error) {
    console.error("Error updating order status:", error)
    throw error
  }

  return data?.[0]
}

// Aktualizace skladu produktu
export async function updateProductStock(productId: string, variantId: string, stock: number) {
  const supabase = browserSupabase

  const { data, error } = await supabase
    .from("product_variants")
    .update({
      stock_quantity: stock,
      updated_at: new Date().toISOString(),
    })
    .eq("id", variantId)
    .eq("product_id", productId)
    .select()

  if (error) {
    console.error("Error updating product stock:", error)
    throw error
  }

  return data?.[0]
}
