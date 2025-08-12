"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DollarSign, ShoppingCart, Users, Package, MoreHorizontal, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"

interface DashboardStatsProps {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
}

export function DashboardStats({ totalRevenue, totalOrders, totalCustomers, totalProducts }: DashboardStatsProps) {
  const stats = [
    {
      title: "Celkové tržby",
      value: `${totalRevenue.toLocaleString("cs-CZ")} Kč`,
      icon: DollarSign,
      change: "+20.1%",
      changeType: "positive" as const,
      progress: 75,
      href: "/analytics?tab=revenue",
      target: 150000,
    },
    {
      title: "Objednávky",
      value: totalOrders.toString(),
      icon: ShoppingCart,
      change: "+8.2%",
      changeType: "positive" as const,
      progress: 60,
      href: "/orders",
      target: 400,
    },
    {
      title: "Zákazníci",
      value: totalCustomers.toString(),
      icon: Users,
      change: "-2.1%",
      changeType: "negative" as const,
      progress: 45,
      href: "/customers",
      target: 200,
    },
    {
      title: "Produkty",
      value: totalProducts.toString(),
      icon: Package,
      change: "+5.7%",
      changeType: "positive" as const,
      progress: 80,
      href: "/products",
      target: 200,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="cursor-pointer hover:shadow-md transition-all duration-200 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className="flex items-center gap-2">
              <stat.icon className="h-4 w-4 text-muted-foreground" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Akce</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={stat.href}>Zobrazit detail</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Exportovat data</DropdownMenuItem>
                  <DropdownMenuItem>Nastavit upozornění</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <Link href={stat.href}>
              <div className="text-2xl font-bold mb-2">{stat.value}</div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant={stat.changeType === "positive" ? "default" : "destructive"} className="text-xs">
                  {stat.changeType === "positive" ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {stat.change}
                </Badge>
                <span className="text-xs text-muted-foreground">{stat.progress}% z cíle</span>
              </div>
              <Progress value={stat.progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">Cíl: {stat.target.toLocaleString("cs-CZ")}</p>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
