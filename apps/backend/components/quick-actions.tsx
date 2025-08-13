"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Package, Users, BarChart3, Settings, ShoppingCart, Search, Zap } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function QuickActions() {
  const [open, setOpen] = useState(false)

  const primaryActions = [
    {
      title: "Nový produkt",
      description: "Přidat produkt",
      icon: Plus,
      href: "/products/new",
      variant: "default" as const,
      badge: "Nejčastější",
    },
    {
      title: "Nová objednávka",
      description: "Vytvořit objednávku",
      icon: ShoppingCart,
      href: "/orders/new",
      variant: "default" as const,
      badge: "Rychlé",
    },
  ]

  const secondaryActions = [
    {
      title: "Objednávky",
      description: "Spravovat objednávky",
      icon: ShoppingCart,
      href: "/orders",
      variant: "outline" as const,
    },
    {
      title: "Zákazníci",
      description: "Seznam zákazníků",
      icon: Users,
      href: "/customers",
      variant: "outline" as const,
    },
    {
      title: "Analytika",
      description: "Podrobné analýzy",
      icon: BarChart3,
      href: "/analytics",
      variant: "outline" as const,
    },
    {
      title: "Produkty",
      description: "Katalog produktů",
      icon: Package,
      href: "/products",
      variant: "outline" as const,
    },
  ]

  const allActions = [
    ...primaryActions,
    ...secondaryActions,
    {
      title: "Nastavení",
      description: "Konfigurace systému",
      icon: Settings,
      href: "/settings",
      variant: "outline" as const,
    },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Rychlé akce
          </CardTitle>
          <CardDescription>Nejčastěji používané funkce pro efektivní správu</CardDescription>
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Hledat akci
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <Command>
              <CommandInput placeholder="Hledat akci..." />
              <CommandList>
                <CommandEmpty>Žádné akce nenalezeny.</CommandEmpty>
                <CommandGroup heading="Dostupné akce">
                  {allActions.map((action) => (
                    <CommandItem
                      key={action.title}
                      onSelect={() => {
                        setOpen(false)
                        window.location.href = action.href
                      }}
                    >
                      <action.icon className="mr-2 h-4 w-4" />
                      <div>
                        <div className="font-medium">{action.title}</div>
                        <div className="text-xs text-muted-foreground">{action.description}</div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Primární akce */}
          <div className="grid gap-3 md:grid-cols-2">
            {primaryActions.map((action) => (
              <Button
                key={action.title}
                variant={action.variant}
                className="h-auto flex-col items-start p-4 space-y-2 relative"
                asChild
              >
                <Link href={action.href}>
                  {action.badge && (
                    <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                      {action.badge}
                    </Badge>
                  )}
                  <div className="flex items-center gap-2 w-full">
                    <action.icon className="h-5 w-5" />
                    <div className="text-left flex-1">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </div>
                </Link>
              </Button>
            ))}
          </div>

          <Separator />

          {/* Sekundární akce */}
          <div className="grid gap-2 md:grid-cols-4">
            {secondaryActions.map((action) => (
              <Button
                key={action.title}
                variant={action.variant}
                className="h-auto flex-col items-center p-3 space-y-2"
                asChild
              >
                <Link href={action.href}>
                  <action.icon className="h-4 w-4" />
                  <div className="text-center">
                    <div className="text-xs font-medium">{action.title}</div>
                    <div className="text-xs text-muted-foreground hidden sm:block">{action.description}</div>
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
