"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Truck, Package, Clock, CheckCircle, ExternalLink, Filter } from "lucide-react"
import Link from "next/link"

export function ShippingOverview() {
  const shippingStats = [
    {
      title: "Připraveno k odeslání",
      count: 12,
      icon: Package,
      color: "bg-blue-500",
      status: "ready",
      progress: 60,
      description: "Objednávky připravené k expedici",
    },
    {
      title: "V přepravě",
      count: 8,
      icon: Truck,
      color: "bg-yellow-500",
      status: "shipped",
      progress: 40,
      description: "Zásilky na cestě k zákazníkům",
    },
    {
      title: "Čeká na vyzvednutí",
      count: 5,
      icon: Clock,
      color: "bg-orange-500",
      status: "waiting",
      progress: 25,
      description: "Zásilky v výdejních místech",
    },
    {
      title: "Doručeno",
      count: 23,
      icon: CheckCircle,
      color: "bg-green-500",
      status: "delivered",
      progress: 100,
      description: "Úspěšně doručené zásilky",
    },
  ]

  const totalShipments = shippingStats.reduce((sum, stat) => sum + stat.count, 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Přehled zásilek</CardTitle>
          <CardDescription>Celkem {totalShipments} aktivních zásilek • Aktuální stav dopravy</CardDescription>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filtrovat zásilky</DialogTitle>
                <DialogDescription>Detailní přehled zásilek podle stavu</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">Vše</TabsTrigger>
                  <TabsTrigger value="ready">Připraveno</TabsTrigger>
                  <TabsTrigger value="shipped">V přepravě</TabsTrigger>
                  <TabsTrigger value="delivered">Doručeno</TabsTrigger>
                </TabsList>
                {shippingStats.map((stat) => (
                  <TabsContent key={stat.status} value={stat.status}>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${stat.color}`}>
                          <stat.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{stat.title}</h3>
                          <p className="text-sm text-muted-foreground">{stat.description}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Počet zásilek</span>
                          <span className="font-medium">{stat.count}</span>
                        </div>
                        <Progress value={stat.progress} className="h-2" />
                      </div>
                      <Button asChild className="w-full">
                        <Link href={`/shipping?status=${stat.status}`}>Zobrazit zásilky</Link>
                      </Button>
                    </div>
                  </TabsContent>
                ))}
                <TabsContent value="all">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Všechny zásilky</h3>
                    <div className="grid gap-3">
                      {shippingStats.map((stat) => (
                        <div key={stat.status} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${stat.color}`}>
                              <stat.icon className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-sm font-medium">{stat.title}</span>
                          </div>
                          <Badge variant="secondary">{stat.count}</Badge>
                        </div>
                      ))}
                    </div>
                    <Button asChild className="w-full">
                      <Link href="/shipping">Zobrazit všechny zásilky</Link>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/shipping">
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {shippingStats.map((stat) => (
            <Button
              key={stat.title}
              variant="ghost"
              className="w-full justify-between h-auto p-4 hover:bg-accent group"
              asChild
            >
              <Link href={`/shipping?status=${stat.status}`}>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{stat.title}</p>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <Badge variant="secondary" className="mb-1">
                      {stat.count}
                    </Badge>
                    <div className="w-16">
                      <Progress value={stat.progress} className="h-1" />
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
