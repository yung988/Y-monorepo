import { createClient } from "./supabase/server";

export const revalidate = 0;

// Typy pro databázové entity
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  category?: string;
  status: "active" | "inactive" | "draft";
  created_at: string;
  updated_at?: string;
  product_variants?: ProductVariant[];
  product_images?: ProductImage[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku?: string;
  price?: number;
  stock_quantity: number;
  attributes?: Record<string, any>;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text?: string;
  sort_order: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id?: string;
  email: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  price: number;
  total: number;
}

// --- Product queries --- (Přímé Supabase dotazy)

export async function getProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }

  return data;
}

export async function getProductsWithVariants() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      product_variants (*),
      product_images (*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products with variants:", error);
    throw new Error("Failed to fetch products with variants");
  }

  return data;
}

export async function getProductById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      product_variants (*),
      product_images (*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching product by id:", error);
    throw new Error(`Failed to fetch product with id: ${id}`);
  }

  return data;
}

// --- Order queries --- (Přímé Supabase dotazy)

export async function getOrders() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    throw new Error("Failed to fetch orders");
  }

  return data;
}

export async function getOrdersWithItems() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders with items:", error);
    throw new Error("Failed to fetch orders with items");
  }

  return data;
}

export async function getOrderById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching order by id:", error);
    throw new Error(`Failed to fetch order with id: ${id}`);
  }

  return data;
}

// --- Dashboard queries --- (Přímé Supabase dotazy)

export async function getDashboardMetrics() {
  const supabase = await createClient();

  try {
    // Paralelní dotazy pro lepší výkon
    const [ordersResult, productsResult] = await Promise.all([
      supabase.from("orders").select("total_amount, created_at"),
      supabase.from("products").select("id"),
    ]);

    const orders = ordersResult.data || [];
    const products = productsResult.data || [];

    // Kalkulace metrik
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter((order) => new Date(order.created_at) >= today).length;

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyOrders = orders.filter(
      (order) => new Date(order.created_at) >= firstDayOfMonth,
    ).length;

    return {
      totalRevenue,
      todayOrders,
      monthlyOrders,
      totalProducts: products.length,
      lowStock: 0, // TODO: Implementovat dotaz na nízký sklad
    };
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return { totalRevenue: 0, todayOrders: 0, monthlyOrders: 0, totalProducts: 0, lowStock: 0 };
  }
}

export async function getRecentOrders(limit = 5) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent orders:", error);
    return [];
  }

  return data;
}

export async function getSalesData() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("total_amount, created_at")
    .order("created_at", { ascending: false })
    .limit(30); // Posledních 30 objednávek

  if (error) {
    console.error("Error fetching sales data:", error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Seskupení prodejů podle dnů (posledních 7 dní)
  const last7Days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    // Najít objednávky pro tento den
    const dayOrders = data.filter((order) => {
      const orderDate = new Date(order.created_at);
      return orderDate >= date && orderDate < nextDay;
    });

    // Sečíst tržby za den (hodnoty jsou v centech, formatPrice je převede na koruny)
    const dailySales = dayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

    last7Days.push({
      date: date.toISOString(),
      sales: dailySales,
    });
  }

  return last7Days;
}
