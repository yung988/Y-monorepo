"use client"

import type React from "react"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SectionCardsProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function SectionCards({ title, description, className, children, ...props }: SectionCardsProps) {
  return (
    <Card className={cn("w-full", className)} {...props}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function SectionCardsContainer() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <SectionCards title="Total Revenue" description="Visitors for the last 6 months">
        <div className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">$1,250.00</div>
        <Badge variant="outline">
          <IconTrendingUp />
          +12.5%
        </Badge>
        <div className="line-clamp-1 flex gap-2 font-medium">
          Trending up this month <IconTrendingUp className="size-4" />
        </div>
      </SectionCards>
      <SectionCards title="New Customers" description="Acquisition needs attention">
        <div className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">1,234</div>
        <Badge variant="outline">
          <IconTrendingDown />
          -20%
        </Badge>
        <div className="line-clamp-1 flex gap-2 font-medium">
          Down 20% this period <IconTrendingDown className="size-4" />
        </div>
      </SectionCards>
      <SectionCards title="Active Accounts" description="Engagement exceed targets">
        <div className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">45,678</div>
        <Badge variant="outline">
          <IconTrendingUp />
          +12.5%
        </Badge>
        <div className="line-clamp-1 flex gap-2 font-medium">
          Strong user retention <IconTrendingUp className="size-4" />
        </div>
      </SectionCards>
      <SectionCards title="Growth Rate" description="Meets growth projections">
        <div className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">4.5%</div>
        <Badge variant="outline">
          <IconTrendingUp />
          +4.5%
        </Badge>
        <div className="line-clamp-1 flex gap-2 font-medium">
          Steady performance increase <IconTrendingUp className="size-4" />
        </div>
      </SectionCards>
    </div>
  )
}
