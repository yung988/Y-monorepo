"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase"

interface AnalyticsData {
  revenue: Array<{ month: string; revenue: number }>
  orders: Array<{ month: string; orders: number }>
  customers: Array<{ month: string; customers: number }>
}

export function useRealtimeAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const supabase = createBrowserClient()

    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true)

        // Fetch initial data from API
        const response = await fetch("/api/analytics")
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data")
        }

        const analyticsData = await response.json()
        setData(analyticsData)
        setIsConnected(true)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
        setIsConnected(false)
      } finally {
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchAnalyticsData()

    // Set up real-time subscriptions
    const ordersSubscription = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          // Refetch data when orders change
          fetchAnalyticsData()
        },
      )
      .subscribe()

    const productsSubscription = supabase
      .channel("products-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        () => {
          // Refetch data when products change
          fetchAnalyticsData()
        },
      )
      .subscribe()

    // Cleanup subscriptions
    return () => {
      ordersSubscription.unsubscribe()
      productsSubscription.unsubscribe()
    }
  }, [])

  return { data, isLoading, error, isConnected }
}
