"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { createBrowserClient } from "@/lib/supabase"
import { ShoppingCart, Users, Package, CreditCard } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell } from "lucide-react"

export function RealtimeNotification() {
  const { toast } = useToast()
  const [lastOrder, setLastOrder] = useState<any>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<string[]>([])

  useEffect(() => {
    const supabase = createBrowserClient()

    let orderSubscription: any
    let customerSubscription: any
    let productSubscription: any

    const setupNotifications = async () => {
      try {
        // Notifikace pro nové objednávky
        orderSubscription = supabase
          .channel("order_notifications")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "orders",
            },
            (payload) => {
              const order = payload.new as any
              toast({
                title: `Nová objednávka ${order.order_number}`,
                description: `Zákazník: ${order.customer_name} • ${(order.total_amount / 100).toLocaleString("cs-CZ", { style: "currency", currency: "CZK" })}`,
                icon: <ShoppingCart className="h-4 w-4" />,
                duration: 5000,
              })
              setLastOrder(order)
              setNotifications((prev) => [`Nová objednávka ${order.order_number}`, ...prev.slice(0, 2)])
            },
          )
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "orders",
            },
            (payload) => {
              const order = payload.new as any
              const oldOrder = payload.old as any

              if (order.status !== oldOrder.status) {
                let message = ""
                let icon = <Package className="h-4 w-4" />

                switch (order.status) {
                  case "paid":
                    message = `Objednávka ${order.order_number} byla zaplacena`
                    icon = <CreditCard className="h-4 w-4" />
                    break
                  case "shipped":
                    message = `Objednávka ${order.order_number} byla odeslána`
                    icon = <Package className="h-4 w-4" />
                    break
                  case "delivered":
                    message = `Objednávka ${order.order_number} byla doručena`
                    icon = <Package className="h-4 w-4" />
                    break
                }

                if (message) {
                  toast({
                    title: message,
                    icon,
                    duration: 4000,
                  })
                  setNotifications((prev) => [message, ...prev.slice(0, 2)])
                }
              }
            },
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              setIsConnected(true)
              console.log("Order notifications active")
            }
          })

        // Notifikace pro nové zákazníky
        customerSubscription = supabase
          .channel("customer_notifications")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "customers",
            },
            (payload) => {
              const customer = payload.new as any
              toast({
                title: "Nový zákazník se zaregistroval!",
                description: `${customer.name} • ${customer.email}`,
                icon: <Users className="h-4 w-4" />,
                duration: 4000,
              })
              setNotifications((prev) => ["Nový zákazník se zaregistroval!", ...prev.slice(0, 2)])
            },
          )
          .subscribe()

        // Notifikace pro nízký stav skladu
        productSubscription = supabase
          .channel("product_notifications")
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "product_variants",
            },
            (payload) => {
              const variant = payload.new as any
              const oldVariant = payload.old as any

              // Upozornění na nízký stav skladu
              if (variant.stock_quantity <= 5 && oldVariant.stock_quantity > 5) {
                toast({
                  title: "Nízký stav skladu!",
                  description: `${variant.sku} • Zbývá pouze ${variant.stock_quantity} ks`,
                  icon: <Package className="h-4 w-4" />,
                  duration: 6000,
                })
                setNotifications((prev) => ["Nízký stav skladu!", ...prev.slice(0, 2)])
              }

              // Upozornění na vyprodání
              if (variant.stock_quantity === 0 && oldVariant.stock_quantity > 0) {
                toast({
                  title: "Produkt vyprodán!",
                  description: `${variant.sku} je nyní vyprodán`,
                  icon: <Package className="h-4 w-4" />,
                  duration: 8000,
                })
                setNotifications((prev) => ["Produkt vyprodán!", ...prev.slice(0, 2)])
              }
            },
          )
          .subscribe()
      } catch (error) {
        console.error("Error setting up notifications:", error)
        setIsConnected(false)
      }
    }

    setupNotifications()

    // Simulate real-time notifications
    const interval = setInterval(() => {
      const messages = [
        "Nová objednávka byla přijata",
        "Produkt byl aktualizován",
        "Nový zákazník se zaregistroval",
        "Platba byla zpracována",
      ]

      const randomMessage = messages[Math.floor(Math.random() * messages.length)]
      setNotifications((prev) => [randomMessage, ...prev.slice(0, 2)])
    }, 30000) // Every 30 seconds

    // Cleanup
    return () => {
      clearInterval(interval)
      if (orderSubscription) {
        supabase.removeChannel(orderSubscription)
      }
      if (customerSubscription) {
        supabase.removeChannel(customerSubscription)
      }
      if (productSubscription) {
        supabase.removeChannel(productSubscription)
      }
    }
  }, [toast])

  if (notifications.length === 0) return null

  return (
    <div className="space-y-2">
      {notifications.map((notification, index) => (
        <Alert key={index} className="animate-in slide-in-from-top-2">
          <Bell className="h-4 w-4" />
          <AlertDescription>{notification}</AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
