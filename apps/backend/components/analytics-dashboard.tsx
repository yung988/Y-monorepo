"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useRealtimeAnalytics } from "@/hooks/use-realtime-analytics"
import { RealtimeIndicator } from "@/components/realtime-indicator"
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Package } from "lucide-react"

const chartConfig = {
  revenue: {
    label: "Tržby",
    color: "hsl(var(--chart-1))",
  },
  orders: {
    label: "Objednávky",
    color: "hsl(var(--chart-2))",
  },
  customers: {
    label: "Zákazníci",
    color: "hsl(var(--chart-3))",
  },
  products: {
    label: "Produkty",
    color: "hsl(var(--chart-4))",
  },
}

const trafficData = [
  { source: "Organické vyhledávání", visitors: 2400, fill: "hsl(var(--chart-1))" },
  { source: "Přímý přístup", visitors: 1398, fill: "hsl(var(--chart-2))" },
  { source: "Sociální sítě", visitors: 800, fill: "hsl(var(--chart-3))" },
  { source: "Email marketing", visitors: 600, fill: "hsl(var(--chart-4))" },
  { source: "Placená reklama", visitors: 400, fill: "hsl(var(--chart-5))" },
]

export function AnalyticsDashboard() {
  const { data, isLoading, error, isConnected } = useRealtimeAnalytics()

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Načítání dat...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-64 text-red-500">Chyba při načítání dat: {error}</div>
  }

  const kpiData = [
    {
      title: "Celkové tržby",
      value: "1,234,567 Kč",
      change: "+12.5%",
      trend: "up" as const,
      icon: DollarSign,
    },
    {
      title: "Objednávky",
      value: "1,234",
      change: "+8.2%",
      trend: "up" as const,
      icon: ShoppingCart,
    },
    {
      title: "Zákazníci",
      value: "856",
      change: "-2.1%",
      trend: "down" as const,
      icon: Users,
    },
    {
      title: "Produkty",
      value: "342",
      change: "+5.7%",
      trend: "up" as const,
      icon: Package,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Přehled výkonnosti</h2>
        <RealtimeIndicator isConnected={isConnected} />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className={`text-xs flex items-center ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {kpi.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {kpi.change} oproti minulému měsíci
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tržby v čase</CardTitle>
            <CardDescription>Měsíční vývoj tržeb</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.revenue || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Objednávky</CardTitle>
            <CardDescription>Počet objednávek za měsíc</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.orders || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="orders" fill="var(--color-orders)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Noví zákazníci</CardTitle>
            <CardDescription>Růst zákaznické základny</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.customers || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="customers" stroke="var(--color-customers)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zdroje návštěvnosti</CardTitle>
            <CardDescription>Odkud přicházejí zákazníci</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="visitors"
                  >
                    {trafficData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
