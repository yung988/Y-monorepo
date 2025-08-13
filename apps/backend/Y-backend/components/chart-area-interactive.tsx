"use client"

import { CartesianGrid, AreaChart, Area, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

const defaultData = [
  { date: "2024-01-01", desktop: 186, mobile: 80 },
  { date: "2024-01-02", desktop: 305, mobile: 200 },
  { date: "2024-01-03", desktop: 237, mobile: 120 },
  { date: "2024-01-04", desktop: 173, mobile: 190 },
  { date: "2024-01-05", desktop: 209, mobile: 130 },
  { date: "2024-01-06", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const data = defaultData

  const total = {
    desktop: data.reduce((acc, curr) => acc + curr.desktop, 0),
    mobile: data.reduce((acc, curr) => acc + curr.mobile, 0),
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Návštěvnost webu</CardTitle>
          <CardDescription>
            Celkem {(total.desktop + total.mobile).toLocaleString()} návštěv za poslední týden
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/analytics">
            <ExternalLink className="h-4 w-4" />
            <span className="sr-only">Zobrazit detailní analytiku</span>
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Link href="/analytics">
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <AreaChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("cs-CZ", { month: "short", day: "numeric" })
                }
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Area
                dataKey="mobile"
                type="natural"
                fill="var(--color-mobile)"
                fillOpacity={0.4}
                stroke="var(--color-mobile)"
                stackId="a"
              />
              <Area
                dataKey="desktop"
                type="natural"
                fill="var(--color-desktop)"
                fillOpacity={0.4}
                stroke="var(--color-desktop)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </Link>
      </CardContent>
    </Card>
  )
}
