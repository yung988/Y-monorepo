"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

const chartData = [
  { month: "Led", revenue: 45000 },
  { month: "Úno", revenue: 52000 },
  { month: "Bře", revenue: 48000 },
  { month: "Dub", revenue: 61000 },
  { month: "Kvě", revenue: 55000 },
  { month: "Čer", revenue: 67000 },
]

const chartConfig = {
  revenue: {
    label: "Tržby",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function RevenueChart() {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Měsíční tržby</CardTitle>
          <CardDescription>Tržby za posledních 6 měsíců</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/analytics?tab=revenue">
            <ExternalLink className="h-4 w-4" />
            <span className="sr-only">Zobrazit detailní analýzu tržeb</span>
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Link href="/analytics?tab=revenue">
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={8} />
            </BarChart>
          </ChartContainer>
        </Link>
      </CardContent>
    </Card>
  )
}
