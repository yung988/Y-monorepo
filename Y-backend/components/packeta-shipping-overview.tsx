"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Truck, Package, CheckCircle, ExternalLink, MapPin, Printer } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getShipments } from "@/lib/supabase-queries-adapted"

export function PacketaShippingOverview() {
  const [shipments, setShipments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadShipments()
  }, [])

  const loadShipments = async () => {
    try {
      const data = await getShipments()
      setShipments(data)
    } catch (error) {
      console.error("Error loading shipments:", error)
    } finally {
      setLoading(false)
    }
  }

  const shippingStats = [
    {
      title: "Připraveno k odeslání",
      count: shipments.filter((s) => s.status === "confirmed" || s.status === "processing").length,
      icon: Package,
      color: "bg-blue-500",
      status: "ready",
      progress: 60,
      description: "Objednávky připravené k expedici",
    },
    {
      title: "Odesláno",
      count: shipments.filter((s) => s.status === "shipped").length,
      icon: Truck,
      color: "bg-yellow-500",
      status: "shipped",
      progress: 40,
      description: "Zásilky na cestě přes Packetu",
    },
    {
      title: "Na výdejním místě",
      count: shipments.filter((s) => s.status === "shipped" && s.pickupPoint).length,
      icon: MapPin,
      color: "bg-orange-500",
      status: "waiting",
      progress: 25,
      description: "Zásilky čekají na vyzvednutí",
    },
    {
      title: "Doručeno",
      count: shipments.filter((s) => s.status === "delivered").length,
      icon: CheckCircle,
      color: "bg-green-500",
      status: "delivered",
      progress: 100,
      description: "Úspěšně doručené zásilky",
    },
  ]

  const totalShipments = shipments.length
  const recentShipments = shipments.slice(0, 5)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Packeta zásilky</CardTitle>
          <CardDescription>Načítání...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    <div className="w-32 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="w-8 h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Packeta zásilky
          </CardTitle>
          <CardDescription>Celkem {totalShipments} zásilek • Integrace s Packeta API</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/shipping">
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Statistiky */}
          <div className="grid grid-cols-2 gap-3">
            {shippingStats.map((stat) => (
              <div key={stat.title} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{stat.title}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {stat.count}
                    </Badge>
                    <div className="flex-1">
                      <Progress value={stat.progress} className="h-1" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Nedávné zásilky */}
          {recentShipments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Nedávné zásilky</h4>
              {recentShipments.map((shipment) => (
                <div
                  key={shipment.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{shipment.orderNumber}</span>
                      {shipment.trackingNumber && (
                        <Badge variant="outline" className="text-xs font-mono">
                          {shipment.trackingNumber}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{shipment.customerName}</span>
                      {shipment.pickupPoint && (
                        <>
                          <span>•</span>
                          <MapPin className="h-3 w-3" />
                          <span>{shipment.pickupPoint}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        shipment.status === "delivered"
                          ? "default"
                          : shipment.status === "shipped"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-xs"
                    >
                      {shipment.status === "delivered"
                        ? "Doručeno"
                        : shipment.status === "shipped"
                          ? "Odesláno"
                          : shipment.status === "processing"
                            ? "Zpracovává se"
                            : "Čekající"}
                    </Badge>
                    {shipment.labelUrl && (
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
                        <a href={shipment.labelUrl} target="_blank" rel="noopener noreferrer">
                          <Printer className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
